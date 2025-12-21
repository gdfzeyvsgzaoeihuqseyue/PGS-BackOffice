module.exports = {
  friendlyName: 'Ajouter un wiki',
  description: 'Ajoute une nouvelle ressource wiki pour une solution spécifique.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom de la ressource wiki.',
    },
    description: {
      type: 'string',
      required: true,
      description: 'Description du contenu.',
    },
    url: {
      type: 'string',
      required: true,
      isURL: true,
      description: 'L\'URL de la ressource.',
    },
    additionalInfo: {
      type: 'string',
      allowNull: true,
      description: 'Informations supplémentaires.',
    },
    platformId: {
      type: 'string',
      required: true,
      description: 'L\'ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'La ressource wiki a été ajoutée avec succès.',
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

      // Générer un slug unique
      const uniqueSlug = await sails.helpers.ids.slug(inputs.name, SolutionWiki);

      // Créer la nouvelle ressource wiki
      const newWiki = await SolutionWiki.create({
        name: inputs.name,
        description: inputs.description,
        url: inputs.url,
        slug: uniqueSlug,
        additionalInfo: inputs.additionalInfo,
        platform: inputs.platformId,
      }).fetch();

      return exits.success({
        success: true,
        message: 'Ressource wiki créée avec succès.',
        data: newWiki,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout de la ressource wiki:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
