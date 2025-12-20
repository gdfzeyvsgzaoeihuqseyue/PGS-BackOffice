module.exports = {
  friendlyName: 'Supprimer un partenaire',
  description: 'Supprime un partenaire existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du partenaire à supprimer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Partenaire supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Partenaire non trouvé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const deletedPartner = await SolutionPartners.destroyOne({ id: inputs.id });

      if (!deletedPartner) {
        return exits.notFound({
          message: 'Partenaire introuvable.',
        });
      }

      return exits.success({
        success: true,
        message: 'Partenaire supprimé avec succès.',
        data: deletedPartner,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression du partenaire:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
