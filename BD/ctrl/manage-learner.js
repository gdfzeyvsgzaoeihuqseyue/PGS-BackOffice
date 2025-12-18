module.exports = {
  friendlyName: 'Manage learner',
  description: 'Gérer un compte apprenant (suspension, activation)',

  inputs: {
    learnerId: {
      type: 'string',
      required: true,
      description: 'ID de l\'apprenant'
    },
    action: {
      type: 'string',
      isIn: ['suspend', 'activate', 'delete', 'verify_email', 'reset_progress'],
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
    learnerNotFound: {
      statusCode: 404,
      description: 'Apprenant non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Trouver l'apprenant
      const learner = await Learner.findOne({ id: inputs.learnerId });

      if (!learner) {
        throw 'learnerNotFound';
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

        case 'reset_progress':
          // Réinitialiser la progression sur tous les services
          await LearnerAccess.update({ learner: inputs.learnerId }).set({
            progress: {},
            completedCourses: []
          });
          actionDescription = 'Progression réinitialisée';
          break;

        case 'delete':
          // Vérifier les rôles (policy actionRoles)

          await Learner.destroyOne({ id: inputs.learnerId });
          actionDescription = 'Compte supprimé';
          break;
      }

      if (inputs.action !== 'delete' && inputs.action !== 'reset_progress') {
        await Learner.updateOne({ id: inputs.learnerId }).set(updateData);
      }

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: `learner_${inputs.action}`,
        targetType: 'learner',
        targetId: inputs.learnerId,
        details: {
          learnerEmail: learner.email,
          reason: inputs.reason || 'Non spécifiée',
          actionDescription
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: actionDescription,
        action: inputs.action,
        learnerId: inputs.learnerId
      });

    } catch (error) {
      if (error === 'learnerNotFound') {
        return exits.learnerNotFound({ message: 'Apprenant non trouvé' });
      }
      if (error === 'forbidden') {
        return exits.forbidden({ message: 'Action non autorisée pour votre rôle' });
      }
      throw error;
    }
  }
};
