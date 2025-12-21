module.exports = {
  friendlyName: 'Supprimer un tutoriel',
  description: 'Supprime un tutoriel existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du tutoriel à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Tutoriel supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Tutoriel non trouvé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedTutorial = await SolutionTutos.destroyOne({ id: inputs.id });

      if (!deletedTutorial) {
        return exits.notFound({ message: 'Tutoriel non trouvé.' });
      }

      return exits.success({
        success: true,
        message: 'Tutoriel supprimé avec succès.',
        data: deletedTutorial,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression du tutoriel:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
