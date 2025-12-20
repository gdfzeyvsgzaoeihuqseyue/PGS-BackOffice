module.exports = {
  friendlyName: 'Obtenir un partenaire',
  description: 'Renvoie un partenaire spécifique par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du partenaire à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le partenaire a été trouvé et renvoyé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun partenaire trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const partner = await SolutionPartners.findOne({ id: inputs.id }).populate('platform');

      if (!partner) {
        return exits.notFound({ message: 'Partenaire non trouvé.' });
      }

      const formattedPartner = {
        id: partner.id,
        name: partner.name,
        website: partner.website,
        logo: partner.logo,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt,
        platform: {
          id: partner.platform ? partner.platform.id : null,
          name: partner.platform ? partner.platform.name : null,
          slug: partner.platform ? partner.platform.slug : null,
        },
      };

      return exits.success({
        success: true,
        message: 'Partenaire récupéré avec succès.',
        data: formattedPartner,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération du partenaire:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
