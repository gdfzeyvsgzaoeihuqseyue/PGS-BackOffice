module.exports = {
  friendlyName: 'Ajouter un document de documentation',
  description: 'Ajoute un nouveau document de documentation pour une solution spécifique.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom du document ou de la ressource.',
    },
    link: {
      type: 'string',
      required: true,
      description: 'L\'URL du document.',
    },
    platformId: {
      type: 'string',
      required: true,
      description: 'L\'ID de la solution associée à ce document.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Le document a été ajouté avec succès.',
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

      // Créer le nouveau document
      const newDoc = await SolutionDocs.create({
        name: inputs.name,
        link: inputs.link,
        platform: inputs.platformId,
      }).fetch();

      return exits.success({
        success: true,
        message: 'Document de documentation créé avec succès.',
        data: newDoc,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout du document de documentation:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
