module.exports = {
  friendlyName: 'Supprimer un wiki',
  description: 'Supprime une ressource wiki existante par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du wiki à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Ressource wiki supprimée avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Ressource wiki non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedWiki = await SolutionWiki.destroyOne({ id: inputs.id });

      if (!deletedWiki) {
        return exits.notFound({ message: 'Ressource wiki non trouvée.' });
      }

      return exits.success({
        success: true,
        message: 'Ressource wiki supprimée avec succès.',
        data: deletedWiki,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression du wiki:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
