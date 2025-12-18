module.exports = {
  friendlyName: 'Manage admin',
  description: 'Gérer un compte administrateur (modification, suspension, suppression)',

  inputs: {
    adminId: {
      type: 'string',
      required: true,
      description: 'ID de l\'administrateur à gérer'
    },
    action: {
      type: 'string',
      isIn: ['update', 'suspend', 'activate', 'delete'],
      required: true,
      description: 'Action à effectuer'
    },
    firstName: {
      type: 'string',
      description: 'Nouveau prénom'
    },
    lastName: {
      type: 'string',
      description: 'Nouveau nom'
    },
    username: {
      type: 'string',
      description: 'Nouveau nom d\'utilisateur'
    },
    role: {
      type: 'string',
      description: 'Nouveau rôle (réservé aux main admins)'
    },
    reason: {
      type: 'string',
      description: 'Raison de l\'action (pour les logs)'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Action effectuée avec succès'
    },
    adminNotFound: {
      statusCode: 404,
      description: 'Administrateur non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    },
    cannotModifySelf: {
      statusCode: 400,
      description: 'Vous ne pouvez pas effectuer cette action sur votre propre compte via cette route'
    },
    usernameAlreadyInUse: {
      statusCode: 409,
      description: 'Le nom d\'utilisateur est déjà pris'
    },
    badRequest: {
      statusCode: 400,
      description: 'La raison de l\'action est manquante'
    },
  },

  fn: async function (inputs, exits) {
    try {
      if (inputs.adminId === this.req.admin.id) {
        return exits.cannotModifySelf({ message: 'Vous ne pouvez pas gérer votre propre compte ici. Utilisez /profile/update.' });
      }

      const targetAdmin = await Admin.findOne({ id: inputs.adminId });
      if (!targetAdmin) {
        throw 'adminNotFound';
      }

      let updateData = {};
      let actionDescription = '';

      switch (inputs.action) {
        case 'update':
          actionDescription = 'Informations mises à jour';

          if (inputs.firstName) updateData.firstName = inputs.firstName;
          if (inputs.lastName) updateData.lastName = inputs.lastName;

          if (inputs.username) {
            const existing = await Admin.findOne({ username: inputs.username, id: { '!=': inputs.adminId } });
            if (existing) throw 'usernameAlreadyInUse';
            updateData.username = inputs.username;
          }

          if (inputs.role) {
            // Vérification stricte : seul un 'main' admin peut modifier le rôle
            if (this.req.admin.role !== 'main') {
              return exits.forbidden({ message: 'La modification de rôle est réservée aux administrateurs principaux.' });
            }
            updateData.role = inputs.role;
            actionDescription += ` (Rôle changé en ${inputs.role})`;
          }
          break;

        case 'suspend':
          updateData.status = 'suspended';
          actionDescription = 'Compte administrateur suspendu';
          break;

        case 'activate':
          updateData.status = 'active';
          actionDescription = 'Compte administrateur activé';
          break;

        case 'delete':
          // La suppression sera gérée après le switch si pas d'erreur
          actionDescription = 'Compte administrateur supprimé';
          break;
      }

      // Appliquer les modifications si ce n'est pas une suppression
      if (inputs.action !== 'delete') {
        // Vérification de sécurité
        if (['suspend', 'activate'].includes(inputs.action)) {
          if (targetAdmin.role === 'main') {
            return exits.forbidden({ message: 'Impossible d\'effectuer des actions sur un administrateur principal.' });
          }
          if (inputs.action === 'suspend' && !inputs.reason) {
            return exits.badRequest({ message: 'Une raison est requise pour suspendre un administrateur.' });
          }
        }

        if (Object.keys(updateData).length > 0) {
          await Admin.updateOne({ id: inputs.adminId }).set(updateData);
        }
      } else {
        // Suppression
        if (targetAdmin.role === 'main') {
          return exits.forbidden({ message: 'Impossible de supprimer un administrateur principal.' });
        }
        if (!inputs.reason) {
          return exits.badRequest({ message: 'Une raison est requise pour supprimer un administrateur.' });
        }
        await Admin.destroyOne({ id: inputs.adminId });
      }

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: `admin_${inputs.action}`,
        targetType: 'admin',
        targetId: inputs.adminId,
        details: {
          targetAdminEmail: targetAdmin.email,
          changes: inputs.action === 'update' ? updateData : {},
          reason: inputs.reason || 'Non spécifiée',
          actionDescription
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: actionDescription,
        action: inputs.action,
        adminId: inputs.adminId
      });

    } catch (error) {
      if (error === 'adminNotFound') return exits.adminNotFound({ message: 'Administrateur non trouvé' });
      if (error === 'forbidden') return exits.forbidden({ message: error.message || 'Action non autorisée' });
      if (error === 'usernameAlreadyInUse') return exits.usernameAlreadyInUse({ message: 'Ce nom d\'utilisateur est déjà utilisé.' });
      if (error === 'cannotModifySelf') return exits.cannotModifySelf({ message: 'Modification de son propre compte interdite ici.' });

      throw error;
    }
  }
};
