module.exports = {
  friendlyName: 'Obtenir tous les auteurs',
  description: 'Renvoie une liste paginée de tous les auteurs de blog.',
  
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
      description: 'Le nombre d\'auteurs à renvoyer par page.',
      max: 100,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste d\'auteurs a été renvoyée avec succès.',
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
      const totalAuthors = await BlogAuthor.count();
      
      const authors = await BlogAuthor.find()
        .skip(skip)
        .limit(inputs.limit)
        .sort('name ASC');
      
      return exits.success({
        success: true,
        message: "Liste des auteurs récupérée avec succès.",
        nb: totalAuthors,
        nbOnPage: authors.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalAuthors / inputs.limit),
        data: authors,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des auteurs:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
