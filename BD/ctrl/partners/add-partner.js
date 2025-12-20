module.exports = {
  friendlyName: 'Ajouter un partenaire à une solution',
  description: 'Ajoute un nouveau partenaire pour une solution spécifique.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom ou organisation du partenaire.',
    },
    website: {
      type: 'string',
      isURL: true,
      description: 'URL du site web du partenaire.',
    },
    logo: {
      type: 'string',
      isURL: true,
      description: 'URL du logo du partenaire.',
    },
    platformId: {
      type: 'string',
      required: true,
      description: 'ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Le partenaire a été ajouté avec succès.',
      responseType: 'created',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'Solution non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que la solution existe
      const platform = await Solution.findOne({ id: inputs.platformId });
      if (!platform) {
        return exits.platformNotFound({
          message: 'La solution spécifiée n\'existe pas.'
        });
      }

      // Créer le nouveau partenaire
      const newPartner = await SolutionPartners.create({
        name: inputs.name,
        website: inputs.website,
        logo: inputs.logo,
        platform: inputs.platformId,
      }).fetch();

      return exits.success({
        success: true,
        message: 'Partenaire ajouté avec succès.',
        data: newPartner,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout du partenaire:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
