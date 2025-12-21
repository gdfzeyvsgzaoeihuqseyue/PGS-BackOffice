module.exports = {
  friendlyName: 'Supprimer un topic FAQ',
  description: 'Supprime un topic de FAQ (et toutes ses FAQs associées).',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du topic à supprimer.',
    },
    deleteFaqs: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Si true, supprime aussi toutes les FAQs du topic.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Topic supprimé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Topic non trouvé.',
    },
    hasFaqs: {
      statusCode: 400,
      description: 'Le topic contient des FAQs.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier si le topic existe
      const topic = await SolutionFaqTopic.findOne({ id: inputs.id });
      if (!topic) {
        return exits.notFound({ message: 'Topic non trouvé.' });
      }

      // Vérifier s'il y a des FAQs associées
      const faqCount = await SolutionFaqs.count({ topic: inputs.id });

      if (faqCount > 0 && !inputs.deleteFaqs) {
        return exits.hasFaqs({
          message: `Ce topic contient ${faqCount} FAQ(s). Utilisez deleteFaqs=true pour les supprimer aussi.`,
          faqCount: faqCount,
        });
      }

      // Supprimer les FAQs si demandé
      if (inputs.deleteFaqs && faqCount > 0) {
        await SolutionFaqs.destroy({ topic: inputs.id });
      }

      // Supprimer le topic
      const deletedTopic = await SolutionFaqTopic.destroyOne({ id: inputs.id });

      return exits.success({
        success: true,
        message: 'Topic supprimé avec succès.',
        data: deletedTopic,
        deletedFaqs: inputs.deleteFaqs ? faqCount : 0,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la suppression du topic:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
