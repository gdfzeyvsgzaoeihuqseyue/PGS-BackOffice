module.exports = {
  friendlyName: 'Obtenir tous les partenaires',
  description: 'Renvoie une liste paginée de tous les partenaires.',

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
      description: 'Le nombre de partenaires à renvoyer par page.',
      max: 100,
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de partenaires a été renvoyée avec succès.',
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
      const totalPartners = await SolutionPartners.count();

      const partners = await SolutionPartners.find()
        .populate('platform')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const formattedPartners = partners.map(partner => {
        return {
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
      });

      return exits.success({
        success: true,
        message: 'Liste des partenaires récupérée avec succès.',
        nb: totalPartners,
        nbOnPage: formattedPartners.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalPartners / inputs.limit),
        data: formattedPartners,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des partenaires:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
