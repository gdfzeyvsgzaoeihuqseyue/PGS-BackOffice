module.exports = {
  friendlyName: 'Mettre à jour un topic FAQ',
  description: 'Met à jour un topic de FAQ existant.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du topic à mettre à jour.',
    },
    name: {
      type: 'string',
      description: 'Le nouveau nom du topic.',
    },
    slug: {
      type: 'string',
      description: 'Le nouveau slug.',
    },
    description: {
      type: 'string',
      description: 'La nouvelle description.',
    },
    platformId: {
      type: 'string',
      description: 'Le nouvel ID de la solution.',
    },
    status: {
      type: 'string',
      isIn: ['active', 'inactive'],
      description: 'Le nouveau statut.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le topic a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Topic non trouvé.',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'La nouvelle solution n\'existe pas.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Préparer les données
      const updatedData = {};

      if (inputs.name !== undefined) updatedData.name = inputs.name;
      if (inputs.slug !== undefined) updatedData.slug = inputs.slug;
      if (inputs.description !== undefined) updatedData.description = inputs.description;
      if (inputs.status !== undefined) updatedData.status = inputs.status;

      // Vérifier la nouvelle solution si fournie
      if (inputs.platformId) {
        const platform = await Solution.findOne({ id: inputs.platformId });
        if (!platform) {
          return exits.platformNotFound({
            message: 'La nouvelle solution n\'existe pas.'
          });
        }
        updatedData.platform = inputs.platformId;
      }

      // Mettre à jour
      const updatedTopic = await SolutionFaqTopic.updateOne({ id: inputs.id })
        .set(updatedData);

      if (!updatedTopic) {
        return exits.notFound({
          message: 'Le topic n\'a pas été trouvé.'
        });
      }

      // Récupérer avec relations
      const populatedTopic = await SolutionFaqTopic.findOne({ id: updatedTopic.id })
        .populate('platform');

      return exits.success({
        success: true,
        message: 'Topic mis à jour avec succès.',
        data: populatedTopic,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour du topic:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
