module.exports = {
  friendlyName: 'Obtenir tous les tutoriels',
  description: 'Renvoie une liste paginée de tous les tutoriels.',

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
      description: 'Le nombre de tutoriels à renvoyer par page.',
      max: 100,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de tutoriels a été renvoyée avec succès.',
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
      const totalTutorials = await SolutionTutos.count();

      const tutorials = await SolutionTutos.find()
        .populate('platform')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const formattedTutorials = tutorials.map(tutorial => {
        return {
          id: tutorial.id,
          title: tutorial.title,
          description: tutorial.description,
          time: tutorial.time,
          link: tutorial.link,
          createdAt: tutorial.createdAt,
          updatedAt: tutorial.updatedAt,
          platform: {
            id: tutorial.platform ? tutorial.platform.id : null,
            name: tutorial.platform ? tutorial.platform.name : null,
            slug: tutorial.platform ? tutorial.platform.slug : null,
          },
        };
      });

      return exits.success({
        success: true,
        message: 'Liste des tutoriels récupérée avec succès.',
        nb: totalTutorials,
        nbOnPage: formattedTutorials.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalTutorials / inputs.limit),
        data: formattedTutorials,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des tutoriels:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
