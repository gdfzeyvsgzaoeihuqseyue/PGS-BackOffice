module.exports = {
  friendlyName: 'Obtenir les topics d\'une plateforme',
  description: 'Renvoie tous les topics FAQ d\'une solution spécifique.',

  inputs: {
    platformId: {
      type: 'string',
      description: 'L\'ID de la solution.',
    },
    platformSlug: {
      type: 'string',
      description: 'Le slug de la solution (alternative à platformId).',
    },
    includeFaqs: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Inclure les FAQs de chaque topic.',
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'active',
      description: 'Filtrer par statut.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Topics récupérés avec succès.',
      responseType: 'ok',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'Solution non trouvée.',
    },
    missingParams: {
      statusCode: 400,
      description: 'Paramètres manquants.',
    },
    serverError: {
      statusCode: 500,
      description: 'Erreur serveur.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier qu'au moins un paramètre est fourni
      if (!inputs.platformId && !inputs.platformSlug) {
        return exits.missingParams({
          message: 'Vous devez fournir platformId ou platformSlug.'
        });
      }

      // Trouver la solution
      const criteria = inputs.platformId
        ? { id: inputs.platformId }
        : { slug: inputs.platformSlug };

      let platform;
      if (typeof Solution !== 'undefined') {
        platform = await Solution.findOne(criteria);
      } else if (sails.models.solution) {
        platform = await sails.models.solution.findOne(criteria);
      } else {
        // Fallback if Solution model is not globally available
        if (inputs.platformId) {
          platform = { id: inputs.platformId };
        } else {
          throw new Error('Solution model not accessible');
        }
      }

      if (!platform) {
        return exits.platformNotFound({
          message: 'Solution non trouvée.'
        });
      }

      // Récupérer les topics
      const topics = await SolutionFaqTopic.find({
        platform: platform.id,
        status: inputs.status
      }).sort('createdAt DESC');

      // Formatter avec FAQs si demandé
      const formattedTopics = await Promise.all(topics.map(async topic => {
        const formatted = {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          description: topic.description,
          status: topic.status,
          platform: {
            id: platform.id,
            name: platform.name,
            slug: platform.slug,
          },
        };

        if (inputs.includeFaqs) {
          const faqs = await SolutionFaqs.find({
            topic: topic.id,
            status: 'active'
          }).sort('createdAt DESC');

          formatted.faqs = faqs.map(faq => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            isUseful: faq.isUseful,
            isUseless: faq.isUseless,
            status: faq.status,
          }));
        }

        formatted.faqCount = await SolutionFaqs.count({
          topic: topic.id,
          status: 'active'
        });

        return formatted;
      }));

      return exits.success({
        success: true,
        message: 'Topics de la solution récupérés avec succès.',
        platform: {
          id: platform.id,
          name: platform.name,
          slug: platform.slug,
        },
        nb: formattedTopics.length,
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
