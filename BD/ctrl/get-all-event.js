module.exports = {
  friendlyName: 'Obtenir tous les événements',
  description: 'Renvoie une liste paginée de tous les événements ou webinaires.',

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
      description: 'Le nombre d\'événements à renvoyer par page.',
      max: 100,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste des événements a été renvoyée avec succès.',
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
      const totalEvents = await EventModel.count();

      const events = await EventModel.find()
        .skip(skip)
        .limit(inputs.limit)
        .sort('date ASC');

      return exits.success({
        success: true,
        message: "Liste des événements récupérée avec succès.",
        nb: totalEvents,
        nbOnPage: events.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalEvents / inputs.limit),
        data: events,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des événements:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
