module.exports = {
  friendlyName: 'Supprimer une solution',
  description: 'Supprime une solution existante par son ID et toutes ses relations associées.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de la solution à supprimer.'
    },
    force: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Si true, supprime même si des relations existent.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Solution supprimée avec succès.'
    },
    notFound: {
      statusCode: 404,
      description: 'Solution non trouvée.'
    },
    hasRelations: {
      statusCode: 400,
      description: 'La solution possède des relations associées.',
    },
    serverError: {
      statusCode: 500,
      description: 'Erreur serveur.'
    },
  },

  fn: async function (inputs, exits) {
    try {
      const platformId = inputs.id;

      const platformToDestroy = await Solution.findOne({ id: platformId });
      if (!platformToDestroy) {
        return exits.notFound({ message: 'Solution non trouvée.' });
      }

      // Compter les relations si force=false
      if (!inputs.force) {
        const relationCounts = {
          docs: await SolutionDocs.count({ platform: platformId }),
          faqTopics: await SolutionFaqTopic.count({ platform: platformId }),
          tutorials: await SolutionTutos.count({ platform: platformId }),
          wiki: await SolutionWiki.count({ platform: platformId }),
          partners: await SolutionPartners.count({ platform: platformId }),
          testimonies: await SolutionTestimonies.count({ platform: platformId }),
        };

        const totalRelations = Object.values(relationCounts).reduce((sum, count) => sum + count, 0);

        if (totalRelations > 0) {
          return exits.hasRelations({
            message: 'La solution possède des relations associées. Utilisez force=true pour supprimer quand même.',
            relations: relationCounts,
            totalRelations: totalRelations,
          });
        }
      }

      // Suppression des relations
      const deletionResults = {};

      // Suppression des FAQ Topics
      const faqTopics = await SolutionFaqTopic.find({ platform: platformId });
      for (const topic of faqTopics) {
        // Supprimer d'abord les FAQs de ce topic
        const deletedFaqs = await SolutionFaqs.destroy({ topic: topic.id });
        deletionResults.faqs = (deletionResults.faqs || 0) + deletedFaqs.length;
      }
      // Puis supprimer les topics
      deletionResults.faqTopics = await SolutionFaqTopic.destroy({ platform: platformId });
      sails.log.info(`Suppression des topics FAQ et FAQs pour ${platformToDestroy.id} réussie.`);

      // Suppression des documents
      deletionResults.docs = await SolutionDocs.destroy({ platform: platformId });
      sails.log.info(`Suppression des documents pour ${platformToDestroy.id} réussie.`);

      // Suppression des tutoriels
      deletionResults.tutorials = await SolutionTutos.destroy({ platform: platformId });
      sails.log.info(`Suppression des tutoriels pour ${platformToDestroy.id} réussie.`);

      // Suppression des wikis
      deletionResults.wiki = await SolutionWiki.destroy({ platform: platformId });
      sails.log.info(`Suppression des wikis pour ${platformToDestroy.id} réussie.`);

      // Suppression des témoignages
      deletionResults.testimonies = await SolutionTestimonies.destroy({ platform: platformId });
      sails.log.info(`Suppression des témoignages pour ${platformToDestroy.id} réussie.`);

      // Suppression des partenaires
      deletionResults.partners = await SolutionPartners.destroy({ platform: platformId });
      sails.log.info(`Suppression des partenaires pour ${platformToDestroy.id} réussie.`);

      // Suppression de la solution elle-même
      const deletedPlatform = await Solution.destroyOne({ id: platformId });
      sails.log.info(`${platformToDestroy.id} supprimé avec succès.`);

      return exits.success({
        success: true,
        message: 'Solution et toutes ses relations supprimées avec succès.',
        data: deletedPlatform,
        deletedRelations: {
          docs: deletionResults.docs?.length || 0,
          faqTopics: deletionResults.faqTopics?.length || 0,
          faqs: deletionResults.faqs || 0,
          tutorials: deletionResults.tutorials?.length || 0,
          wiki: deletionResults.wiki?.length || 0,
          partners: deletionResults.partners?.length || 0,
          testimonies: deletionResults.testimonies?.length || 0,
        },
      });

    } catch (err) {
      sails.log.error('Erreur lors de la suppression de la solution:', err);
      return exits.serverError({
        message: 'Erreur lors de la suppression de la solution.',
        error: err.message
      });
    }
  },
};
