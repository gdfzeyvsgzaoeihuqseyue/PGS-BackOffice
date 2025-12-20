module.exports = {
  friendlyName: 'Mettre à jour un témoignage',
  description: 'Met à jour un témoignage existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du témoignage à mettre à jour.',
    },
    author: {
      type: 'string',
      description: 'Nom de la personne qui témoigne',
    },
    company: {
      type: 'string',
      description: 'Nom de l\'entreprise ou organisation',
    },
    role: {
      type: 'string',
      description: 'Poste ou fonction de la personne',
    },
    content: {
      type: 'string',
      description: 'Contenu du témoignage',
    },
    note: {
      type: 'number',
      min: 1,
      max: 5,
      description: 'Note sur 5 étoiles',
    },
    avatar: {
      type: 'string',
      isURL: true,
      description: 'URL de l\'avatar de la personne',
    },
    isPublished: {
      type: 'boolean',
      description: 'Le témoignage est-il publié ?',
    },
    isFeatured: {
      type: 'boolean',
      description: 'Témoignage mis en avant ?',
    },
    platformId: {
      type: 'string',
      description: 'Nouvel ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Témoignage mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Témoignage non trouvé.',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'La solution spécifiée n\'existe pas.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const updatedData = { ...inputs };
      delete updatedData.id;

      // Vérifier la solution si platformId fourni
      if (inputs.platformId) {
        const platform = await Solution.findOne({ id: inputs.platformId });
        if (!platform) {
          return exits.platformNotFound({
            message: 'La solution spécifiée n\'existe pas.'
          });
        }
        updatedData.platform = inputs.platformId;
      }

      const updatedTestimony = await SolutionTestimonies.updateOne({ id: inputs.id }).set(updatedData);

      if (!updatedTestimony) {
        return exits.notFound({ message: 'Témoignage non trouvé.' });
      }

      const populatedTestimony = await SolutionTestimonies.findOne({ id: updatedTestimony.id }).populate('platform');

      return exits.success({
        success: true,
        message: 'Témoignage mis à jour avec succès.',
        data: populatedTestimony,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour du témoignage:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
