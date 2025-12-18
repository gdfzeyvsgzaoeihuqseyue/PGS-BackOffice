module.exports = {
  friendlyName: 'Manage user',
  description: 'Gérer un compte utilisateur (suspension, activation)',

  inputs: {
    userId: {
      type: 'string',
      required: true,
      description: 'ID de l\'utilisateur'
    },
    action: {
      type: 'string',
      isIn: ['suspend', 'activate', 'delete', 'verify_email'],
      required: true,
      description: 'Action à effectuer'
    },
    reason: {
      type: 'string',
      description: 'Raison de l\'action'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Action effectuée avec succès'
    },
    userNotFound: {
      statusCode: 404,
      description: 'Utilisateur non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Trouver l'utilisateur
      const user = await User.findOne({ id: inputs.userId });

      if (!user) {
        throw 'userNotFound';
      }

      let updateData = {};
      let actionDescription = '';

      switch (inputs.action) {
        case 'suspend':
          updateData.isActive = false;
          actionDescription = 'Compte suspendu';
          break;

        case 'activate':
          updateData.isActive = true;
          actionDescription = 'Compte activé';
          break;

        case 'verify_email':
          updateData.emailVerified = true;
          actionDescription = 'Email vérifié';
          break;

        case 'delete':
          // Vérifier les rôles (policy actionRoles)

          await User.destroyOne({ id: inputs.userId });
          actionDescription = 'Compte supprimé';
          break;
      }

      if (inputs.action !== 'delete') {
        await User.updateOne({ id: inputs.userId }).set(updateData);
      }

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: `user_${inputs.action}`,
        targetType: 'user',
        targetId: inputs.userId,
        details: {
          userEmail: user.email,
          reason: inputs.reason || 'Non spécifiée',
          actionDescription
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: actionDescription,
        action: inputs.action,
        userId: inputs.userId
      });

    } catch (error) {
      if (error === 'userNotFound') {
        return exits.userNotFound({ message: 'Utilisateur non trouvé' });
      }
      if (error === 'forbidden') {
        return exits.forbidden({ message: 'Action non autorisée pour votre rôle' });
      }
      throw error;
    }
  }
};
