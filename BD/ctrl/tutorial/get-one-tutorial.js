module.exports = {
  friendlyName: 'Obtenir un tutoriel',
  description: 'Renvoie un tutoriel spécifique par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du tutoriel à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le tutoriel a été trouvé et renvoyé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun tutoriel trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const tutorial = await SolutionTutos.findOne({ id: inputs.id }).populate('platform');

      if (!tutorial) {
        return exits.notFound({ message: 'Tutoriel non trouvé.' });
      }

      const formattedTutorial = {
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

      return exits.success({
        success: true,
        message: 'Tutoriel récupéré avec succès.',
        data: formattedTutorial,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération du tutoriel:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
