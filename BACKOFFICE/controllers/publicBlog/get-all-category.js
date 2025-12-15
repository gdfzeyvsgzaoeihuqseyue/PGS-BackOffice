module.exports = {
  friendlyName: 'Obtenir toutes les catégories',
  description: 'Renvoie une liste paginée de toutes les catégories de blog.',

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
      description: 'Le nombre de catégories à renvoyer par page.',
      max: 100,
    },
  },
  
  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de catégories a été renvoyée avec succès.',
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
      const totalCategories = await BlogCategorie.count();
      
      const categories = await BlogCategorie.find()
        .skip(skip)
        .limit(inputs.limit)
        .sort('name ASC');
      
      return exits.success({
        success: true,
        message: "Liste des catégories récupérée avec succès.",
        nb: totalCategories,
        nbOnPage: categories.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalCategories / inputs.limit),
        data: categories,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des catégories:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
