module.exports = {
  friendlyName: 'Obtenir un wiki',
  description: 'Renvoie une ressource wiki spécifique par son ID ou son slug.',

  inputs: {
    identifier: {
      type: 'string',
      required: true,
      description: 'L\'ID ou le slug du wiki à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La ressource wiki a été trouvée et renvoyée avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune ressource wiki trouvée avec l\'identifiant fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const wiki = await SolutionWiki.findOne({
          or: [
            { id: inputs.identifier },
            { slug: inputs.identifier }
          ]
        })
        .populate('platform');

      if (!wiki) {
        return exits.notFound({ message: 'Ressource wiki non trouvée.' });
      }

      const formattedWiki = {
        id: wiki.id,
        name: wiki.name,
        description: wiki.description,
        url: wiki.url,
        slug: wiki.slug,
        additionalInfo: wiki.additionalInfo,
        createdAt: wiki.createdAt,
        updatedAt: wiki.updatedAt,
        platform: {
          id: wiki.platform ? wiki.platform.id : null,
          name: wiki.platform ? wiki.platform.name : null,
          slug: wiki.platform ? wiki.platform.slug : null,
        },
      };

      return exits.success({
        success: true,
        message: 'Wiki récupéré avec succès.',
        data: formattedWiki,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération du wiki:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
