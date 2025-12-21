module.exports = {
  friendlyName: 'Ajouter un topic FAQ',
  description: 'Crée un nouveau topic/sujet de FAQ pour une solution.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Le nom du topic.',
      example: 'Authentification',
    },
    description: {
      type: 'string',
      description: 'Description courte du topic.',
    },
    platformId: {
      type: 'string',
      required: true,
      description: 'L\'ID de la solution/plateforme associée.',
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      defaultsTo: 'active',
      description: 'Le statut du topic.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Le topic a été créé avec succès.',
      responseType: 'created',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'Solution non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que la solution existe
      const platform = await Solution.findOne({ id: inputs.platformId });
      if (!platform) {
        return exits.platformNotFound({
          message: 'La solution spécifiée n\'existe pas.'
        });
      }

      // Générer le slug si non fourni
      const uniqueSlug = await sails.helpers.ids.slug.with({
        text: inputs.name,
        model: SolutionFaqTopic,
      });

      // Créer le nouveau topic
      const newTopic = await SolutionFaqTopic.create({
        name: inputs.name,
        slug: uniqueSlug,
        description: inputs.description,
        platform: inputs.platformId,
        status: inputs.status,
      }).fetch();

      // Récupérer avec les relations
      const populatedTopic = await SolutionFaqTopic.findOne({ id: newTopic.id })
        .populate('platform');

      return exits.success({
        success: true,
        message: 'Topic créé avec succès.',
        data: populatedTopic,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la création du topic:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
