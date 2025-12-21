module.exports = {
  friendlyName: 'Obtenir toutes les FAQs',
  description: 'Renvoie une liste paginée de toutes les questions fréquemment posées.',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Le numéro de la page pour la pagination.',
      min: 1,
    },
    limit: {
      type: 'number',
      defaultsTo: 10,
      description: 'Le nombre de FAQs à renvoyer par page.',
      max: 100,
    },
    topicId: {
      type: 'string',
      description: 'Filtrer par topic (optionnel).',
    },
    platformId: {
      type: 'string',
      description: 'Filtrer par plateforme (optionnel).',
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      description: 'Filtrer par statut (optionnel).',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste de FAQs a été renvoyée avec succès.',
      responseType: 'ok',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const skip = (inputs.page - 1) * inputs.limit;

      // Construire les critères de recherche
      const criteria = {};
      if (inputs.topicId) criteria.topic = inputs.topicId;
      if (inputs.status) criteria.status = inputs.status;

      // Si platformId est fourni, trouver les topics de cette plateforme
      if (inputs.platformId) {
        const topics = await SolutionFaqTopic.find({
          platform: inputs.platformId
        }).select(['id']);

        const topicIds = topics.map(t => t.id);
        criteria.topic = { in: topicIds };
      }

      const totalFaqs = await SolutionFaqs.count(criteria);

      const faqs = await SolutionFaqs.find(criteria)
        .populate('topic')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      // Formatter avec topic et platform
      const formattedFaqs = await Promise.all(faqs.map(async faq => {
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

        return {
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
          } : null,
          platform: platformData,
        };
      }));

      return exits.success({
        success: true,
        message: 'Liste des FAQs récupérée avec succès.',
        nb: totalFaqs,
        nbOnPage: formattedFaqs.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalFaqs / inputs.limit),
        data: formattedFaqs,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des FAQs:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
