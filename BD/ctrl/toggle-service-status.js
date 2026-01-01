module.exports = {
  friendlyName: 'Toggle service status',
  description: 'Activer ou désactiver un service',

  inputs: {
    serviceId: {
      type: 'string',
      required: true,
      description: 'ID du service'
    },
    isActive: {
      type: 'boolean',
      required: true,
      description: 'Nouveau statut (true = actif, false = inactif)'
    },
    reason: {
      type: 'string',
      description: 'Raison du changement de statut'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Statut modifié avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Service non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que seuls main et admin peuvent modifier le statut
      if (!this.req.admin ||
        !['main', 'admin'].includes(this.req.admin.role)) {
        throw 'forbidden';
      }

      // Vérifier que le service existe
      const service = await Service.findOne({ id: inputs.serviceId });

      if (!service) {
        throw 'notFound';
      }

      // Vérifier si le statut change réellement
      if (service.isActive === inputs.isActive) {
        return exits.success({
          message: 'Le service a déjà ce statut',
          service: {
            id: service.id,
            name: service.name,
            isActive: service.isActive
          }
        });
      }

      // Mettre à jour le statut
      const updatedService = await Service.updateOne({ id: inputs.serviceId })
        .set({ isActive: inputs.isActive });

      // Compter les accès impactés
      const impactedUsers = await UserAccess.count({
        service: service.id,
        isActive: true
      });

      const impactedLearners = await LearnerAccess.count({
        service: service.id,
        isActive: true
      });

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: inputs.isActive ? 'activate_service' : 'deactivate_service',
        targetType: 'service',
        targetId: inputs.serviceId,
        details: {
          serviceName: service.name,
          serviceDomain: service.domain,
          previousStatus: service.isActive,
          newStatus: inputs.isActive,
          reason: inputs.reason || 'Non spécifiée',
          impactedAccess: {
            users: impactedUsers,
            learners: impactedLearners,
            total: impactedUsers + impactedLearners
          }
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: inputs.isActive ? 'Service activé' : 'Service désactivé',
        service: {
          id: updatedService.id,
          name: updatedService.name,
          domain: updatedService.domain,
          isActive: updatedService.isActive
        },
        impact: {
          message: inputs.isActive ?
            `${impactedUsers + impactedLearners} utilisateurs peuvent maintenant accéder au service` :
            `${impactedUsers + impactedLearners} utilisateurs ne peuvent plus accéder au service`,
          users: impactedUsers,
          learners: impactedLearners
        }
      });

    } catch (error) {
      if (error === 'notFound') {
        return exits.notFound({ message: 'Service non trouvé' });
      }
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seuls les roles main et admin peuvent modifier le statut des services'
        });
      }
      throw error;
    }
  }
};
