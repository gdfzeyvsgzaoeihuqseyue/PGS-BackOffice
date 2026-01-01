module.exports = {
  friendlyName: 'List services',
  description: 'Récupérer la liste de tous les services avec pagination',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Numéro de page'
    },
    limit: {
      type: 'number',
      defaultsTo: 20,
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
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Liste récupérée avec succès'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // if (!this.req.admin) {
      //   throw 'forbidden';
      // }

      const skip = (inputs.page - 1) * inputs.limit;

      // Construire la requête
      let criteria = {};

      if (inputs.isActive !== undefined) {
        criteria.isActive = inputs.isActive;
      }

      if (inputs.search) {
        criteria.or = [
          { name: { contains: inputs.search } },
          { domain: { contains: inputs.search } },
          { description: { contains: inputs.search } }
        ];
      }

      // Récupérer les services
      const services = await Service.find(criteria)
        .limit(inputs.limit)
        .skip(skip)
        .sort('createdAt DESC');

      // Compter le total
      const totalServices = await Service.count(criteria);

      // Compter les utilisateurs et apprenants par service
      const servicesWithStats = await Promise.all(services.map(async (service) => {
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
        services: servicesWithStats,
        pagination: {
          page: inputs.page,
          limit: inputs.limit,
          total: totalServices,
          totalPages: Math.ceil(totalServices / inputs.limit)
        }
      });

    } catch (error) {
      // if (error === 'forbidden') {
      //   return exits.forbidden({ message: 'Action non autorisée' });
      // }
      throw error;
    }
  }
};
