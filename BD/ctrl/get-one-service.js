module.exports = {
  friendlyName: 'Get service details',
  description: 'Récupérer tous les détails d\'un service avec ses utilisateurs et apprenants',

  inputs: {
    serviceId: {
      type: 'string',
      required: true,
      description: 'ID du service'
    },
    includeUsers: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Inclure la liste des utilisateurs'
    },
    includeLearners: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Inclure la liste des apprenants'
    },
    usersPage: {
      type: 'number',
      defaultsTo: 1,
      description: 'Page des utilisateurs'
    },
    learnersPage: {
      type: 'number',
      defaultsTo: 1,
      description: 'Page des apprenants'
    },
    limit: {
      type: 'number',
      defaultsTo: 10,
      max: 50,
      description: 'Nombre d\'utilisateurs/apprenants par page'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Détails récupérés avec succès'
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
      // Récupérer le service
      const service = await Service.findOne({ id: inputs.serviceId });

      if (!service) {
        throw 'notFound';
      }

      // Statistiques globales
      const totalUsers = await UserAccess.count({
        service: service.id,
        isActive: true
      });

      const totalLearners = await LearnerAccess.count({
        service: service.id,
        isActive: true
      });

      const inactiveUsers = await UserAccess.count({
        service: service.id,
        isActive: false
      });

      const inactiveLearners = await LearnerAccess.count({
        service: service.id,
        isActive: false
      });

      // Détails du service
      const serviceDetails = {
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
          users: {
            active: totalUsers,
            inactive: inactiveUsers,
            total: totalUsers + inactiveUsers
          },
          learners: {
            active: totalLearners,
            inactive: inactiveLearners,
            total: totalLearners + inactiveLearners
          },
          totalAccess: totalUsers + totalLearners
        }
      };

      // Inclure les utilisateurs si demandé
      let usersData = null;
      if (inputs.includeUsers) {
        const usersSkip = (inputs.usersPage - 1) * inputs.limit;

        const userAccesses = await UserAccess.find({
          service: service.id
        })
          .populate('user')
          .limit(inputs.limit)
          .skip(usersSkip)
          .sort('createdAt DESC');

        usersData = {
          items: userAccesses.map(ua => ({
            accessId: ua.id,
            user: ua.user ? {
              id: ua.user.id,
              firstName: ua.user.firstName,
              lastName: ua.user.lastName,
              email: ua.user.email,
              isActive: ua.user.isActive
            } : null,
            role: ua.role,
            permissions: ua.customPermissions,
            isActive: ua.isActive,
            lastAccess: ua.lastAccess,
            enrollmentDate: ua.createdAt
          })),
          pagination: {
            page: inputs.usersPage,
            limit: inputs.limit,
            total: totalUsers + inactiveUsers,
            totalPages: Math.ceil((totalUsers + inactiveUsers) / inputs.limit)
          }
        };
      }

      // Inclure les apprenants si demandé
      let learnersData = null;
      if (inputs.includeLearners) {
        const learnersSkip = (inputs.learnersPage - 1) * inputs.limit;

        const learnerAccesses = await LearnerAccess.find({
          service: service.id
        })
          .populate('learner')
          .limit(inputs.limit)
          .skip(learnersSkip)
          .sort('createdAt DESC');

        learnersData = {
          items: learnerAccesses.map(la => ({
            accessId: la.id,
            learner: la.learner ? {
              id: la.learner.id,
              firstName: la.learner.firstName,
              lastName: la.learner.lastName,
              email: la.learner.email,
              isActive: la.learner.isActive
            } : null,
            role: la.role,
            permissions: la.customPermissions,
            isActive: la.isActive,
            lastAccess: la.lastAccess,
            enrollmentDate: la.enrollmentDate,
            progress: la.progress,
            completedCourses: la.completedCourses
          })),
          pagination: {
            page: inputs.learnersPage,
            limit: inputs.limit,
            total: totalLearners + inactiveLearners,
            totalPages: Math.ceil((totalLearners + inactiveLearners) / inputs.limit)
          }
        };
      }

      return exits.success({
        service: serviceDetails,
        users: usersData,
        learners: learnersData
      });

    } catch (error) {
      if (error === 'notFound') {
        return exits.notFound({ message: 'Service non trouvé' });
      }
      if (error === 'forbidden') {
        return exits.forbidden({ message: 'Action non autorisée' });
      }
      throw error;
    }
  }
};
