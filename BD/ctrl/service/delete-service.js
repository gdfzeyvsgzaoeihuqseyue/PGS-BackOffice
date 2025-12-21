module.exports = {
  friendlyName: 'Delete service',
  description: 'Supprimer définitivement un service (action critique)',

  inputs: {
    serviceId: {
      type: 'string',
      required: true,
      description: 'ID du service à supprimer'
    },
    confirmation: {
      type: 'string',
      required: true,
      description: 'Nom exact du service pour confirmation'
    },
    deleteAccessRecords: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Supprimer aussi les enregistrements d\'accès (users + learners)'
    },
    reason: {
      type: 'string',
      required: true,
      minLength: 10,
      description: 'Raison détaillée de la suppression (minimum 10 caractères)'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Service supprimé avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Service non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    },
    confirmationMismatch: {
      statusCode: 400,
      description: 'La confirmation ne correspond pas'
    },
    hasActiveAccess: {
      statusCode: 409,
      description: 'Le service a des accès actifs'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que seul "main" peut supprimer
      if (!this.req.admin || this.req.admin.role !== 'main') {
        throw 'forbidden';
      }

      // Récupérer le service
      const service = await Service.findOne({ id: inputs.serviceId });

      if (!service) {
        throw 'notFound';
      }

      // Vérifier la confirmation (nom exact du service)
      if (inputs.confirmation !== service.name) {
        throw 'confirmationMismatch';
      }

      // Compter les accès actifs
      const activeUsersCount = await UserAccess.count({
        service: service.id,
        isActive: true
      });

      const activeLearnersCount = await LearnerAccess.count({
        service: service.id,
        isActive: true
      });

      const totalActiveAccess = activeUsersCount + activeLearnersCount;

      // Si des accès actifs existent et qu'on ne force pas la suppression
      if (totalActiveAccess > 0 && !inputs.deleteAccessRecords) {
        throw 'hasActiveAccess';
      }

      // Compter tous les accès (actifs + inactifs)
      const totalUsersAccess = await UserAccess.count({ service: service.id });
      const totalLearnersAccess = await LearnerAccess.count({ service: service.id });

      // Logger AVANT la suppression (important !)
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'delete_service',
        targetType: 'service',
        targetId: service.id,
        details: {
          serviceName: service.name,
          serviceDomain: service.domain,
          reason: inputs.reason,
          stats: {
            activeUsers: activeUsersCount,
            activeLearners: activeLearnersCount,
            totalUsersAccess: totalUsersAccess,
            totalLearnersAccess: totalLearnersAccess
          },
          deleteAccessRecords: inputs.deleteAccessRecords
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent'],
        status: 'success'
      });

      // Supprimer les accès si demandé
      let deletedUsersAccess = 0;
      let deletedLearnersAccess = 0;

      if (inputs.deleteAccessRecords) {
        const deletedUsers = await UserAccess.destroy({ service: service.id }).fetch();
        deletedUsersAccess = deletedUsers.length;

        const deletedLearners = await LearnerAccess.destroy({ service: service.id }).fetch();
        deletedLearnersAccess = deletedLearners.length;
      }

      // Supprimer le service
      await Service.destroyOne({ id: service.id });

      return exits.success({
        message: 'Service supprimé définitivement',
        deletedService: {
          id: service.id,
          name: service.name,
          domain: service.domain
        },
        deletedAccess: {
          users: deletedUsersAccess,
          learners: deletedLearnersAccess,
          total: deletedUsersAccess + deletedLearnersAccess
        },
        warnings: [
          'Cette action est irréversible',
          inputs.deleteAccessRecords ?
            `${deletedUsersAccess + deletedLearnersAccess} enregistrements d'accès ont été supprimés` :
            `Les ${totalUsersAccess + totalLearnersAccess} enregistrements d'accès ont été conservés (orphelins)`
        ]
      });

    } catch (error) {
      // Logger l'échec
      if (error !== 'notFound') {
        await AdminActivityLog.create({
          admin: this.req.admin?.id,
          action: 'delete_service',
          targetType: 'service',
          targetId: inputs.serviceId,
          details: {
            reason: inputs.reason,
            error: error.toString()
          },
          ipAddress: this.req.ip,
          userAgent: this.req.headers['user-agent'],
          status: 'failed',
          errorMessage: error.toString()
        });
      }

      if (error === 'notFound') {
        return exits.notFound({ message: 'Service non trouvé' });
      }
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seul le role "main" peut supprimer des services'
        });
      }
      if (error === 'confirmationMismatch') {
        return exits.confirmationMismatch({
          message: 'La confirmation ne correspond pas au nom du service'
        });
      }
      if (error === 'hasActiveAccess') {
        return exits.hasActiveAccess({
          message: 'Impossible de supprimer : le service a des accès actifs',
          details: {
            activeUsers: await UserAccess.count({ service: inputs.serviceId, isActive: true }),
            activeLearners: await LearnerAccess.count({ service: inputs.serviceId, isActive: true })
          },
          suggestion: 'Utilisez deleteAccessRecords: true pour forcer la suppression'
        });
      }
      throw error;
    }
  }
};
