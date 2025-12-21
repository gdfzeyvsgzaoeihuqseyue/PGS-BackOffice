module.exports = {
  friendlyName: 'Obtenir tous les wikis',
  description: 'Renvoie une liste paginée de toutes les ressources wiki, avec des filtres optionnels.',

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
      description: 'Le nombre de ressources à renvoyer par page.',
      max: 100,
    },
    startLetter: {
      type: 'string',
      description: 'Filtre optionnel par la première lettre du nom du wiki.',
      allowNull: true,
    },
    platformId: {
      type: 'string',
      description: 'Filtre optionnel par l\'ID de la solution.',
      allowNull: true,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste des ressources wiki a été renvoyée avec succès.',
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
      const criteria = {};

      if (inputs.startLetter) {
        criteria.name = { 'like': `${inputs.startLetter}%` };
      }

      if (inputs.platformId) {
        criteria.platform = inputs.platformId;
      }

      const totalWikis = await SolutionWiki.count(criteria);

      const wikis = await SolutionWiki.find(criteria)
        .populate('platform')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const formattedWikis = wikis.map(wiki => ({
        id: wiki.id,
        name: wiki.name,
        description: wiki.description,
        url: wiki.url,
        slug: wiki.slug,
        additionalInfo: wiki.additionalInfo,
        platform: {
          id: wiki.platform ? wiki.platform.id : null,
          name: wiki.platform ? wiki.platform.name : null,
          slug: wiki.platform ? wiki.platform.slug : null,
        },
        createdAt: wiki.createdAt,
        updatedAt: wiki.updatedAt,
      }));

      return exits.success({
        success: true,
        message: 'Liste des wikis récupérée avec succès.',
        nb: totalWikis,
        nbOnPage: formattedWikis.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalWikis / inputs.limit),
        data: formattedWikis,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des wikis:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
