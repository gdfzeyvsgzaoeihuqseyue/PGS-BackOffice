module.exports = {
  friendlyName: 'Supprimer un article de blog',
  description: 'Supprime un article de blog par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'article à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'article a été supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun article trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },
  
  fn: async function (inputs, exits) {
    try {
      const deletedArticle = await Blog.destroyOne({ id: inputs.id });

      if (!deletedArticle) {
        return exits.notFound({
          message: 'Article non trouvé.',
        });
      }
      
      return exits.success({
        success: true,
        message: 'Article supprimé avec succès.',
        data: deletedArticle,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression de l\'article:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
