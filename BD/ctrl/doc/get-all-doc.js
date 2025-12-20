module.exports = {
  friendlyName: 'Obtenir tous les documents de documentation',
  description: 'Renvoie une liste paginée de tous les documents de documentation.',

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
      description: 'Le nombre de documents à renvoyer par page.',
      max: 100,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de documents a été renvoyée avec succès.',
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
      const totalDocs = await SolutionDocs.count();

      const docs = await SolutionDocs.find()
        .populate('platform')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const formattedDocs = docs.map(doc => {
        return {
          id: doc.id,
          name: doc.name,
          link: doc.link,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          platform: {
            id: doc.platform ? doc.platform.id : null,
            name: doc.platform ? doc.platform.name : null,
            slug: doc.platform ? doc.platform.slug : null,
          },
        };
      });

      return exits.success({
        success: true,
        message: 'Liste des documents récupérée avec succès.',
        nb: totalDocs,
        nbOnPage: formattedDocs.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalDocs / inputs.limit),
        data: formattedDocs,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des documents:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
