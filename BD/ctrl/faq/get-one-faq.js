module.exports = {
  friendlyName: 'Obtenir une FAQ',
  description: 'Renvoie une question fréquemment posée spécifique par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de la FAQ à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La FAQ a été trouvée et renvoyée avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune FAQ trouvée avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const faq = await SolutionFaqs.findOne({ id: inputs.id })
        .populate('topic');

      if (!faq) {
        return exits.notFound({ message: 'FAQ non trouvée.' });
      }

      // Récupérer les infos de la plateforme via le topic
      let platformData = null;
      if (faq.topic) {
        const topic = await SolutionFaqTopic.findOne({ id: faq.topic.id })
          .populate('platform');
        
        platformData = topic && topic.platform ? {
          id: topic.platform.id,
          name: topic.platform.name,
          slug: topic.platform.slug,
        } : null;
      }

      const formattedFaq = {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
        isUseful: faq.isUseful,
        isUseless: faq.isUseless,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
        topic: faq.topic ? {
          id: faq.topic.id,
          name: faq.topic.name,
          slug: faq.topic.slug,
          description: faq.topic.description,
        } : null,
        platform: platformData,
      };

      return exits.success({
        success: true,
        message: 'FAQ récupérée avec succès.',
        data: formattedFaq,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération de la FAQ:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
