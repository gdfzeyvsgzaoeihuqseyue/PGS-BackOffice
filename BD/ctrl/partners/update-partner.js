module.exports = {
  friendlyName: 'Mettre à jour un partenaire',
  description: 'Met à jour un partenaire existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du partenaire à mettre à jour.',
    },
    name: {
      type: 'string',
      description: 'Le nouveau nom du partenaire.',
    },
    website: {
      type: 'string',
      isURL: true,
      description: 'La nouvelle URL du site web du partenaire.',
    },
    logo: {
      type: 'string',
      isURL: true,
      description: 'La nouvelle URL du logo du partenaire.',
    },
    platformId: {
      type: 'string',
      description: 'Le nouvel ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Partenaire mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun partenaire trouvé avec l\'ID fourni.',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'La solution spécifiée n\'existe pas.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const updatedData = { ...inputs };
      delete updatedData.id;

      // Vérifier si la nouvelle solution existe
      if (inputs.platformId) {
        const platform = await Solution.findOne({ id: inputs.platformId });
        if (!platform) {
          return exits.platformNotFound({
            message: 'La solution spécifiée n\'existe pas.',
          });
        }
        updatedData.platform = inputs.platformId;
      }

      const updatedPartner = await SolutionPartners.updateOne({ id: inputs.id }).set(updatedData);

      if (!updatedPartner) {
        return exits.notFound({
          message: 'Partenaire à mettre à jour introuvable.',
        });
      }

      // Récupérer avec info de la solution liée
      const populatedPartner = await SolutionPartners.findOne({ id: updatedPartner.id }).populate('platform');

      return exits.success({
        success: true,
        message: 'Partenaire mis à jour avec succès.',
        data: populatedPartner,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour du partenaire:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
