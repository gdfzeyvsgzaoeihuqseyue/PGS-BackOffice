module.exports = {
  friendlyName: 'Obtenir un topic FAQ',
  description: 'Renvoie un topic de FAQ spécifique avec ses FAQs.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du topic.',
    },
    includeFaqs: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Inclure les FAQs du topic.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Topic trouvé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Topic non trouvé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Erreur serveur.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const topic = await SolutionFaqTopic.findOne({ id: inputs.id })
        .populate('platform');

      if (!topic) {
        return exits.notFound({ message: 'Topic non trouvé.' });
      }

      const formattedTopic = {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        status: topic.status,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
        platform: topic.platform ? {
          id: topic.platform.id,
          name: topic.platform.name,
          slug: topic.platform.slug,
        } : null,
      };

      // Inclure les FAQs si demandé
      if (inputs.includeFaqs) {
        const faqs = await SolutionFaqs.find({
          topic: topic.id
        }).sort('createdAt ASC');

        formattedTopic.faqs = faqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          status: faq.status,
          isUseful: faq.isUseful,
          isUseless: faq.isUseless,
          createdAt: faq.createdAt,
          updatedAt: faq.updatedAt,
        }));
      }

      formattedTopic.faqCount = await SolutionFaqs.count({ topic: topic.id });

      return exits.success({
        success: true,
        message: 'Topic récupéré avec succès.',
        data: formattedTopic,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération du topic:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
