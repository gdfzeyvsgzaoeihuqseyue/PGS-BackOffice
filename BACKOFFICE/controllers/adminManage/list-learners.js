module.exports = {
  friendlyName: 'List learners',
  description: 'Récupérer la liste de tous les apprenants avec pagination',
  
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
      description: 'Recherche par email ou nom'
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
  
  fn: async function(inputs, exits) {
    try {
      if (!this.req.superAdmin) {
        throw 'forbidden';
      }
      
      const skip = (inputs.page - 1) * inputs.limit;
      
      // Construire la requête
      let criteria = {};
      
      if (inputs.isActive !== undefined) {
        criteria.isActive = inputs.isActive;
      }
      
      if (inputs.search) {
        criteria.or = [
          { email: { contains: inputs.search.toLowerCase() } },
          { firstName: { contains: inputs.search } },
          { lastName: { contains: inputs.search } }
        ];
      }
      
      // Récupérer les apprenants
      const learners = await Learner.find(criteria)
        .limit(inputs.limit)
        .skip(skip)
        .sort('createdAt DESC');
      
      // Compter le total
      const totalLearners = await Learner.count(criteria);
      
      return exits.success({
        learners: learners.map(learner => ({
          id: learner.id,
          firstName: learner.firstName,
          lastName: learner.lastName,
          username: learner.username,
          email: learner.email,
          emailVerified: learner.emailVerified,
          isActive: learner.isActive,
          phoneNumber: learner.phoneNumber,
          lastLogin: learner.lastLogin,
          createdAt: learner.createdAt
        })),
        pagination: {
          page: inputs.page,
          limit: inputs.limit,
          total: totalLearners,
          totalPages: Math.ceil(totalLearners / inputs.limit)
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
