module.exports = {
  friendlyName: 'Obtenir un événement',
  description: 'Renvoie un événement spécifique par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'événement à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'événement a été trouvé et renvoyé avec succès.',
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
      const event = await EventModel.findOne({ id: inputs.id });

      if (!event) {
        return exits.notFound({
          message: 'Événement non trouvé.'
        });
      }

      return exits.success({
        success: true,
        message: 'Événement récupéré avec succès.',
        data: event,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération de l\'événement:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
