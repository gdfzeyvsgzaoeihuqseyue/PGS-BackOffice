module.exports = {
  friendlyName: 'Ajouter un tutoriel',
  description: 'Ajoute un nouveau tutoriel pour une solution spécifique.',

  inputs: {
    title: {
      type: 'string',
      required: true,
      description: 'Le titre du tutoriel.',
    },
    description: {
      type: 'string',
      description: 'Une courte description du tutoriel.',
    },
    time: {
      type: 'string',
      description: 'La durée du tutoriel (ex: 5min, 12:30).',
    },
    link: {
      type: 'string',
      required: true,
      description: 'Le lien vers la vidéo ou le guide.',
    },
    platformId: {
      type: 'string',
      required: true,
      description: 'L\'ID de la solution associée à ce tutoriel.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Le tutoriel a été ajouté avec succès.',
      responseType: 'created',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'Solution non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que la solution existe
      const platform = await Solution.findOne({ id: inputs.platformId });
      if (!platform) {
        return exits.platformNotFound({
          message: 'La solution spécifiée n\'existe pas.'
        });
      }

      // Créer le nouveau tutoriel
      const newTutorial = await SolutionTutos.create({
        title: inputs.title,
        description: inputs.description,
        time: inputs.time,
        link: inputs.link,
        platform: inputs.platformId,
      }).fetch();

      return exits.success({
        success: true,
        message: 'Tutoriel créé avec succès.',
        data: newTutorial,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout du tutoriel:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
