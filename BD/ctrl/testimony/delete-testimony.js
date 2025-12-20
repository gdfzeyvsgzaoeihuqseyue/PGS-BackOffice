module.exports = {
  friendlyName: 'Supprimer un témoignage',
  description: 'Supprime un témoignage existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du témoignage à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Témoignage supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Témoignage non trouvé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedTestimony = await SolutionTestimonies.destroyOne({ id: inputs.id });

      if (!deletedTestimony) {
        return exits.notFound({ message: 'Témoignage non trouvé.' });
      }

      return exits.success({
        success: true,
        message: 'Témoignage supprimé avec succès.',
        data: deletedTestimony,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression du témoignage:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
