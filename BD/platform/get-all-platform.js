module.exports = {
  friendlyName: 'Obtenir toutes les solutions',
  description: 'Renvoie une liste paginée et filtrée de toutes les solutions disponibles.',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Le numéro de la page pour la pagination.',
      min: 1,
    },
    limit: {
      type: 'number',
      defaultsTo: 10,
      description: 'Le nombre de solutions à renvoyer par page.',
      max: 100,
    },
    category: {
      type: 'string',
      description: 'Filtrer par catégorie spécifique.',
    },
    allowAuth: {
      type: 'boolean',
      description: 'Filtrer par solutions autorisant les authentifications.',
    },
    authType: {
      type: 'string',
      isIn: ['all', 'user', 'learner'],
      description: "Filtrer par type d'authentification.",
    },
    disabled: {
      type: 'boolean',
      description: 'Filtrer par statut désactivé/activé.',
    },
    search: {
      type: 'string',
      description: 'Recherche textuelle dans le nom et la description.',
    },
    sortBy: {
      type: 'string',
      defaultsTo: 'createdAt',
      isIn: ['name', 'createdAt', 'updatedAt', 'category'],
      description: 'Champ de tri.',
    },
    sortOrder: {
      type: 'string',
      defaultsTo: 'DESC',
      isIn: ['ASC', 'DESC'],
      description: 'Ordre de tri.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste des solutions a été renvoyée avec succès.',
      responseType: 'ok',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const skip = (inputs.page - 1) * inputs.limit;

      // Filtres
      let whereClause = {};

      if (inputs.category) {
        whereClause.category = inputs.category;
      }

      if (typeof inputs.allowAuth === 'boolean') {
        whereClause.allowAuth = inputs.allowAuth;
      }

      if (inputs.authType) {
        whereClause.authType = inputs.authType;
      }

      if (typeof inputs.disabled === 'boolean') {
        whereClause.disabled = inputs.disabled;
      }

      if (inputs.search) {
        whereClause.or = [
          { name: { contains: inputs.search } },
          { description: { contains: inputs.search } }
        ];
      }

      // Compter le total avec les filtres
      const totalSolutions = await Solution.count(whereClause);

      // Récupérer les solutions avec filtres et tri
      const solutions = await Solution.find(whereClause)
        .skip(skip)
        .limit(inputs.limit)
        .sort(`${inputs.sortBy} ${inputs.sortOrder}`);

      // Formatage de date
      const formattedSolutions = await Promise.all(solutions.map(async (solution) => ({
        ...solution,
        createdAt: await sails.helpers.utils.formatDate(solution.createdAt, 'long'),
        updatedAt: await sails.helpers.utils.formatDate(solution.updatedAt, 'relative'),
      })));

      return exits.success({
        success: true,
        message: 'Liste des solutions récupérée avec succès.',
        nb: totalSolutions,
        nbOnPage: formattedSolutions.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalSolutions / inputs.limit),
        filters: {
          category: inputs.category,
          allowAuth: inputs.allowAuth,
          authType: inputs.authType,
          disabled: inputs.disabled,
          search: inputs.search,
          sortBy: inputs.sortBy,
          sortOrder: inputs.sortOrder
        },
        data: formattedSolutions,
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération des solutions:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
