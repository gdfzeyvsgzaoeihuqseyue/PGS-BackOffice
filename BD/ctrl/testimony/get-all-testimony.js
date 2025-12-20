module.exports = {
  friendlyName: 'Obtenir tous les témoignages',
  description: 'Renvoie une liste paginée de tous les témoignages.',

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
      description: 'Le nombre de témoignages à renvoyer par page.',
      max: 100,
    },
    isPublished: {
      type: 'boolean',
      allowNull: true,
      description: 'Filtrer par les témoignages publiés.',
    },
    isFeatured: {
      type: 'boolean',
      allowNull: true,
      description: 'Filtrer par les témoignages mis en avant.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste des témoignages a été renvoyée avec succès.',
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
      const criteria = {};
      if (typeof inputs.isPublished === 'boolean') {
        criteria.isPublished = inputs.isPublished;
      }
      if (typeof inputs.isFeatured === 'boolean') {
        criteria.isFeatured = inputs.isFeatured;
      }

      const skip = (inputs.page - 1) * inputs.limit;
      const totalTestimonies = await SolutionTestimonies.count(criteria);

      const testimonies = await SolutionTestimonies.find(criteria)
        .populate('platform')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const formattedTestimonies = testimonies.map(testimony=> ({
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
      }));

      return exits.success({
        success: true,
        message: 'Liste des témoignages récupérée avec succès.',
        nb: totalTestimonies,
        nbOnPage: formattedTestimonies.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalTestimonies / inputs.limit),
        data: formattedTestimonies,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des témoignages:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
