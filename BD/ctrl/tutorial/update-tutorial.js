module.exports = {
  friendlyName: 'Mettre à jour un tutoriel',
  description: 'Met à jour un tutoriel existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du tutoriel à mettre à jour.',
    },
    title: {
      type: 'string',
      description: 'Le nouveau titre du tutoriel.',
    },
    description: {
      type: 'string',
      description: 'La nouvelle description du tutoriel.',
    },
    time: {
      type: 'string',
      description: 'La nouvelle durée du tutoriel.',
    },
    link: {
      type: 'string',
      description: 'Le nouveau lien du tutoriel.',
    },
    platformId: {
      type: 'string',
      description: 'Le nouvel ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le tutoriel a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun tutoriel trouvé avec l\'ID fourni.',
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

      // Vérifier si la nouvelle solution existe si platformId est fourni
      if (inputs.platformId) {
        const platform = await Solution.findOne({ id: inputs.platformId });
        if (!platform) {
          return exits.platformNotFound({ message: 'La nouvelle solution spécifiée n\'existe pas.' });
        }
        updatedData.platform = inputs.platformId;
      }

      // Mettre à jour l'enregistrement
      const updatedTutorial = await SolutionTutos.updateOne({ id: inputs.id }).set(updatedData);

      if (!updatedTutorial) {
        return exits.notFound({ message: 'Le tutoriel à mettre à jour n\'a pas été trouvé.' });
      }

      // Renvoyer le tutoriel mis à jour avec les informations de la solution
      const populatedTutorial = await SolutionTutos.findOne({ id: updatedTutorial.id }).populate('platform');

      return exits.success({
        success: true,
        message: 'Tutoriel mis à jour avec succès.',
        data: populatedTutorial,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour du tutoriel:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
