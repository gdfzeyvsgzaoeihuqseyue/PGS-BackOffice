module.exports = {
  friendlyName: 'Obtenir tous les topics FAQ',
  description: 'Renvoie une liste paginée de tous les topics de FAQ.',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Numéro de page.',
      min: 1,
    },
    limit: {
      type: 'number',
      defaultsTo: 20,
      description: 'Nombre de topics par page.',
      max: 100,
    },
    platformId: {
      type: 'string',
      description: 'Filtrer par solution/plateforme.',
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      description: 'Filtrer par statut.',
    },
    includeFaqs: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Inclure les FAQs de chaque topic.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Liste récupérée avec succès.',
      responseType: 'ok',
    },
    serverError: {
      statusCode: 500,
      description: 'Erreur serveur.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const skip = (inputs.page - 1) * inputs.limit;

      // Construire les critères
      const criteria = {};
      if (inputs.platformId) criteria.platform = inputs.platformId;
      if (inputs.status) criteria.status = inputs.status;

      const totalTopics = await SolutionFaqTopic.count(criteria);

      const topics = await SolutionFaqTopic.find(criteria)
        .populate('platform')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt ASC');

      // Formatter les topics
      const formattedTopics = await Promise.all(topics.map(async topic => {
        const formatted = {
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

        // Ajouter les FAQs si demandé
        if (inputs.includeFaqs) {
          const faqs = await SolutionFaqs.find({
            topic: topic.id,
            status: 'active'
          }).sort('createdAt ASC');

          formatted.faqs = faqs.map(faq => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            isUseful: faq.isUseful,
            isUseless: faq.isUseless,
          }));
          formatted.faqCount = faqs.length;
        } else {
          // Juste le nombre de FAQs
          formatted.faqCount = await SolutionFaqs.count({
            topic: topic.id,
            status: 'active'
          });
        }

        return formatted;
      }));

      return exits.success({
        success: true,
        message: 'Liste des topics récupérée avec succès.',
        nb: totalTopics,
        nbOnPage: formattedTopics.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalTopics / inputs.limit),
        data: formattedTopics,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des topics:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
