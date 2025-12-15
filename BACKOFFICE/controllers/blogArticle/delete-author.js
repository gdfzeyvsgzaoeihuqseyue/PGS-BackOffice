module.exports = {
  friendlyName: 'Supprimer un auteur de blog',
  description: 'Supprime un auteur de blog par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'auteur à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'auteur a été supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun auteur trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedAuthor = await BlogAuthor.destroyOne({ id: inputs.id });
      
      if (!deletedAuthor) {
        return exits.notFound({
          message: 'Auteur non trouvé.',
        });
      }
      
      return exits.success({
        success: true,
        message: 'Auteur supprimé avec succès.',
        data: deletedAuthor,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression de l\'auteur:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
