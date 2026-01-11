module.exports = {
  friendlyName: 'List services',
  description: 'Récupérer la liste de tous les services avec pagination',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      min: 1,
      description: 'Numéro de page'
    },
    limit: {
      type: 'number',
      defaultsTo: 10,
      max: 100,
      description: 'Nombre d\'éléments par page'
    },
    search: {
      type: 'string',
      description: 'Recherche par nom ou domaine'
    },
    isActive: {
      type: 'boolean',
      description: 'Filtrer par statut actif/inactif'
    },
    sortBy: {
      type: 'string',
      defaultsTo: 'createdAt',
      isIn: ['name', 'createdAt', 'updatedAt', 'domain'],
      description: 'Champ de tri.'
    },
    sortOrder: {
      type: 'string',
      defaultsTo: 'DESC',
      isIn: ['ASC', 'DESC'],
      description: 'Ordre de tri.'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Liste récupérée avec succès',
      responseType: 'ok'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // if (!this.req.admin) {
      //   throw 'forbidden';
      // }

      const skip = (inputs.page - 1) * inputs.limit;

      // Construire la requête
      let whereClause = {};

      if (inputs.isActive !== undefined) {
        whereClause.isActive = inputs.isActive;
      }

      if (inputs.search) {
        whereClause.or = [
          { name: { contains: inputs.search } },
          { domain: { contains: inputs.search } },
          { description: { contains: inputs.search } }
        ];
      }

      // Compter le total avec les filtres
      const totalServices = await Service.count(whereClause);

      // Récupérer les services
      const services = await Service.find(whereClause)
        .limit(inputs.limit)
        .skip(skip)
        .sort(`${inputs.sortBy} ${inputs.sortOrder}`);

      // Compter les utilisateurs et apprenants par service
      const formattedServices = await Promise.all(services.map(async (service) => {
        const userAccessCount = await UserAccess.count({
          service: service.id,
          isActive: true
        });

        const learnerAccessCount = await LearnerAccess.count({
          service: service.id,
          isActive: true
        });

        return {
          id: service.id,
          name: service.name,
          domain: service.domain,
          description: service.description,
          isActive: service.isActive,
          allowedOrigins: service.allowedOrigins,
          apiKey: service.apiKey,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          stats: {
            totalUsers: userAccessCount,
            totalLearners: learnerAccessCount,
            totalAccess: userAccessCount + learnerAccessCount
          }
        };
      }));

      return exits.success({
        success: true,
        message: 'Liste des services récupérée avec succès.',
        nb: totalServices,
        nbOnPage: formattedServices.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalServices / inputs.limit),
        filters: {
          search: inputs.search,
          isActive: inputs.isActive,
          sortBy: inputs.sortBy,
          sortOrder: inputs.sortOrder
        },
        data: formattedServices
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération des services:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  }
};

