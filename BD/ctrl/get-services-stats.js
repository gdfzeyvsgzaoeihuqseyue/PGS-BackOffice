module.exports = {
  friendlyName: 'Get services statistics',
  description: 'Récupérer les statistiques globales de tous les services',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Statistiques récupérées avec succès'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que l'utilisateur a le droit (tous les roles peuvent voir les stats)
      if (!this.req.admin) {
        throw 'forbidden';
      }

      // Statistiques globales services
      const totalServices = await Service.count();
      const activeServices = await Service.count({ isActive: true });
      const inactiveServices = await Service.count({ isActive: false });

      // Statistiques accès utilisateurs
      const totalUserAccess = await UserAccess.count();
      const activeUserAccess = await UserAccess.count({ isActive: true });

      // Statistiques accès apprenants
      const totalLearnerAccess = await LearnerAccess.count();
      const activeLearnerAccess = await LearnerAccess.count({ isActive: true });

      // Top 5 services par nombre d'utilisateurs
      const allServices = await Service.find();

      const servicesWithCounts = await Promise.all(allServices.map(async (service) => {
        const usersCount = await UserAccess.count({
          service: service.id,
          isActive: true
        });

        const learnersCount = await LearnerAccess.count({
          service: service.id,
          isActive: true
        });

        return {
          id: service.id,
          name: service.name,
          domain: service.domain,
          isActive: service.isActive,
          usersCount,
          learnersCount,
          totalAccess: usersCount + learnersCount
        };
      }));

      // Trier par nombre total d'accès
      servicesWithCounts.sort((a, b) => b.totalAccess - a.totalAccess);

      const topServices = servicesWithCounts.slice(0, 5);
      const leastUsedServices = servicesWithCounts.slice(-5).reverse();

      // Services sans utilisateurs
      const unusedServices = servicesWithCounts.filter(s => s.totalAccess === 0);

      // Calcul moyennes
      const avgAccessPerService = servicesWithCounts.length > 0 ?
        (totalUserAccess + totalLearnerAccess) / servicesWithCounts.length : 0;

      return exits.success({
        overview: {
          services: {
            total: totalServices,
            active: activeServices,
            inactive: inactiveServices
          },
          access: {
            users: {
              total: totalUserAccess,
              active: activeUserAccess,
              inactive: totalUserAccess - activeUserAccess
            },
            learners: {
              total: totalLearnerAccess,
              active: activeLearnerAccess,
              inactive: totalLearnerAccess - activeLearnerAccess
            },
            combined: {
              total: totalUserAccess + totalLearnerAccess,
              active: activeUserAccess + activeLearnerAccess,
              inactive: (totalUserAccess - activeUserAccess) + (totalLearnerAccess - activeLearnerAccess)
            }
          },
          averages: {
            accessPerService: Math.round(avgAccessPerService * 100) / 100
          }
        },
        topServices: {
          title: 'Services les plus utilisés',
          data: topServices
        },
        leastUsedServices: {
          title: 'Services les moins utilisés',
          data: leastUsedServices
        },
        unusedServices: {
          title: 'Services sans utilisateurs',
          count: unusedServices.length,
          data: unusedServices.map(s => ({
            id: s.id,
            name: s.name,
            domain: s.domain,
            isActive: s.isActive
          }))
        },
        healthIndicators: {
          servicesUtilization: totalServices > 0 ?
            Math.round((activeServices / totalServices) * 100) : 0,
          accessRate: totalUserAccess + totalLearnerAccess > 0 ?
            Math.round(((activeUserAccess + activeLearnerAccess) / (totalUserAccess + totalLearnerAccess)) * 100) : 0,
          unusedServicesPercentage: totalServices > 0 ?
            Math.round((unusedServices.length / totalServices) * 100) : 0
        }
      });

    } catch (error) {
      if (error === 'forbidden') {
        return exits.forbidden({ message: 'Action non autorisée' });
      }
      throw error;
    }
  }
};
