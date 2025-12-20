module.exports = {
  friendlyName: 'Supprimer un document de documentation',
  description: 'Supprime un document de documentation existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du document à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Document supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Document non trouvé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedDoc = await SolutionDocs.destroyOne({ id: inputs.id });

      if (!deletedDoc) {
        return exits.notFound({ message: 'Document de documentation non trouvé.' });
      }

      return exits.success({
        success: true,
        message: 'Document de documentation supprimé avec succès.',
        data: deletedDoc,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression du document:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
