module.exports = {
  friendlyName: 'Toggle service access',
  description: 'Activer ou désactiver l\'accès d\'un utilisateur ou apprenant à un service spécifique',

  inputs: {
    targetId: {
      type: 'string',
      required: true,
      description: 'ID de l\'utilisateur ou de l\'apprenant'
    },
    serviceId: {
      type: 'string',
      required: true,
      description: 'ID du service'
    },
    targetType: {
      type: 'string',
      required: true,
      isIn: ['user', 'learner'],
      description: 'Type de la cible (user ou learner)'
    },
    isActive: {
      type: 'boolean',
      required: true,
      description: 'Nouvel état de l\'accès'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Accès mis à jour avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Accès non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérification des droits admin
      if (!this.req.admin) {
        throw 'forbidden';
      }

      let AccessModel;
      let query = {
        service: inputs.serviceId
      };

      if (inputs.targetType === 'user') {
        AccessModel = UserAccess;
        query.user = inputs.targetId;
      } else {
        AccessModel = LearnerAccess;
        query.learner = inputs.targetId;
      }

      // Rechercher l'accès existant
      const existingAccess = await AccessModel.findOne(query);

      if (!existingAccess) {
        return exits.notFound({
          message: `Aucun accès trouvé pour ce ${inputs.targetType === 'user' ? 'utilisateur' : 'apprenant'} sur ce service`
        });
      }

      // Mettre à jour le statut
      const updatedAccess = await AccessModel.updateOne(query)
        .set({
          isActive: inputs.isActive
        });

      if (!updatedAccess) {
        throw 'notFound';
      }

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'toggle_service_access',
        targetType: inputs.targetType,
        targetId: inputs.targetId,
        details: {
          serviceId: inputs.serviceId,
          newStatus: inputs.isActive ? 'active' : 'inactive'
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: 'Accès mis à jour avec succès',
        access: updatedAccess
      });

    } catch (error) {
      if (error === 'forbidden') {
        return exits.forbidden({ message: 'Seuls les administrateurs peuvent effectuer cette action' });
      }
      if (error === 'notFound') {
        return exits.notFound({ message: 'Accès non trouvé' });
      }
      throw error;
    }
  }
};
