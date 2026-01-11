module.exports = {
  friendlyName: 'Supprimer un événement',
  description: 'Supprime un événement existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'événement à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'événement a été supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun événement trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedEvent = await EventModel.destroyOne({ id: inputs.id });

      if (!deletedEvent) {
        return exits.notFound({
          message: 'Événement non trouvé.'
        });
      }

      return exits.success({
        success: true,
        message: 'Événement supprimé avec succès.',
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression de l\'événement:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
