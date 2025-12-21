module.exports = {
  friendlyName: 'Voter FAQ inutile',
  description: 'Incrémente le compteur de votes "inutile" d\'une FAQ.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de la FAQ à voter.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Vote enregistré avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'FAQ non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que la FAQ existe
      const faq = await SolutionFaqs.findOne({ id: inputs.id });

      if (!faq) {
        return exits.notFound({ 
          message: 'FAQ non trouvée.' 
        });
      }

      // Incrémenter le compteur isUseless
      const updatedFaq = await SolutionFaqs.updateOne({ id: inputs.id })
        .set({ 
          isUseless: faq.isUseless + 1 
        });

      return exits.success({
        success: true,
        message: 'Vote "inutile" enregistré avec succès.',
        data: {
          id: updatedFaq.id,
          isUseful: updatedFaq.isUseful,
          isUseless: updatedFaq.isUseless,
          totalVotes: updatedFaq.isUseful + updatedFaq.isUseless,
        },
      });
    } catch (err) {
      sails.log.error('Erreur lors du vote inutile:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
