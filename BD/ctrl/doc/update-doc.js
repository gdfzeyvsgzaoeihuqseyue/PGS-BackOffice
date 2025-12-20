module.exports = {
  friendlyName: 'Mettre à jour un document de documentation',
  description: 'Met à jour un document de documentation existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du document à mettre à jour.',
    },
    name: {
      type: 'string',
      description: 'Le nouveau nom du document.',
    },
    link: {
      type: 'string',
      description: 'La nouvelle URL du document.',
    },
    platformId: {
      type: 'string',
      description: 'Le nouvel ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le document a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun document trouvé avec l\'ID fourni.',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'La nouvelle solution spécifiée n\'existe pas.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Préparer les données pour la mise à jour
      const updatedData = { ...inputs };
      delete updatedData.id;

      // Vérifier si la nouvelle solution existe
      if (inputs.platformId) {
        const platform = await Solution.findOne({
          id: inputs.platformId
        });
        if (!platform) {
          return exits.platformNotFound({
            message: 'La nouvelle solution spécifiée n\'existe pas.'
          });
        }
        updatedData.platform = inputs.platformId;
      }

      // Mettre à jour l'enregistrement
      const updatedDoc = await SolutionDocs.updateOne({
        id: inputs.id
      }).set(updatedData);

      if (!updatedDoc) {
        return exits.notFound({
          message: 'Le document à mettre à jour n\'a pas été trouvé.'
        });
      }

      // Renvoyer le document mis à jour avec les informations de la solution
      const populatedDoc = await SolutionDocs.findOne({ id: updatedDoc.id }).populate('platform');

      // Renvoie l'objet peuplé
      return exits.success({
        success: true,
        message: 'Document mis à jour avec succès.',
        data: populatedDoc,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour du document:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
