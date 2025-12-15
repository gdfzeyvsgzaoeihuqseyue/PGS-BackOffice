module.exports = {
  friendlyName: 'Supprimer une catégorie de blog',
  description: 'Supprime une catégorie de blog par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de la catégorie de blog à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La catégorie a été supprimée avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune catégorie trouvée avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },
  
  fn: async function (inputs, exits) {
    try {
      const deletedCategory = await BlogCategorie.destroyOne({ id: inputs.id });
      
      if (!deletedCategory) {
        return exits.notFound({
          message: 'Catégorie non trouvée.',
        });
      }
      
      return exits.success({
        success: true,
        message: 'Catégorie supprimée avec succès.',
        data: deletedCategory,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression de la catégorie:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
