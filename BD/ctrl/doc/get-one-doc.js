module.exports = {
  friendlyName: 'Obtenir un document de documentation',
  description: 'Renvoie un document de documentation spécifique par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du document à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le document a été trouvé et renvoyé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun document trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const doc = await SolutionDocs.findOne({ id: inputs.id }).populate('platform');

      if (!doc) {
        return exits.notFound({ message: 'Document de documentation non trouvé.' });
      }

      const formattedDoc = {
        id: doc.id,
        name: doc.name,
        link: doc.link,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        platform: {
          id: doc.platform ? doc.platform.id : null,
          name: doc.platform ? doc.platform.name : null,
          slug: doc.platform ? doc.platform.slug : null,
        },
      };

      return exits.success({
        success: true,
        message: 'Document récupéré avec succès.',
        data: formattedDoc,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération du document:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
