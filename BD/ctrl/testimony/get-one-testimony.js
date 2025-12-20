module.exports = {
  friendlyName: 'Obtenir un témoignage',
  description: 'Renvoie un témoignage spécifique par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du témoignage à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le témoignage a été trouvé et renvoyé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun témoignage trouvé avec l\'ID fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const testimony = await SolutionTestimonies.findOne({ id: inputs.id }).populate('platform');

      if (!testimony) {
        return exits.notFound({ message: 'Témoignage non trouvé.' });
      }

      const formattedTestimony = {
        id: testimony.id,
        author: testimony.author,
        company: testimony.company,
        role: testimony.role,
        content: testimony.content,
        note: testimony.note,
        avatar: testimony.avatar,
        isPublished: testimony.isPublished,
        isFeatured: testimony.isFeatured,
        createdAt: testimony.createdAt,
        updatedAt: testimony.updatedAt,
        platform: {
          id: testimony.platform ? testimony.platform.id : null,
          name: testimony.platform ? testimony.platform.name : null,
          slug: testimony.platform ? testimony.platform.slug : null,
        },
      };

      return exits.success({
        success: true,
        message: 'Témoignage récupéré avec succès.',
        data: formattedTestimony,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération du témoignage:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
