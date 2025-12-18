module.exports = {
  friendlyName: 'Obtenir tous les articles',
  description: 'Renvoie une liste paginée de tous les articles de blog avec leurs relations.',

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
      description: 'Le nombre d\'articles à renvoyer par page.',
      max: 100,
    },
    authorId: {
      type: 'string',
      description: 'Filtrer par ID d\'auteur.',
    },
    categoryId: {
      type: 'string',
      description: 'Filtrer par ID de catégorie.',
    },
    tags: {
      type: 'json',
      description: 'Filtrer par une liste de tags (au moins un doit matcher).',
      example: ['tech', 'ai'],
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La liste d\'articles a été renvoyée avec succès.',
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

      // Construire dynamiquement le filtre
      const where = {};
      if (inputs.authorId) {
        where.author = inputs.authorId;
      }
      if (inputs.categoryId) {
        where.category = inputs.categoryId;
      }
      if (inputs.tags && Array.isArray(inputs.tags) && inputs.tags.length > 0) {
        where.tags = { in: inputs.tags };
      }

      const totalArticles = await Blog.count(where);

      const articles = await Blog.find({ where })
        .populate('author')
        .populate('category')
        .skip(skip)
        .limit(inputs.limit)
        .sort('createdAt DESC');

      const formattedArticles = articles.map(article => {
        return {
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          imageUrl: article.imageUrl,
          tags: article.tags,
          views: article.views,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          category: article.category ? {
            id: article.category.id,
            name: article.category.name,
            slug: article.category.slug,
          } : null,
          author: article.author ? {
            id: article.author.id,
            name: article.author.name,
            slug: article.author.slug,
          } : null,
        };
      });

      return exits.success({
        success: true,
        message: "Liste des articles récupérée avec succès.",
        nb: totalArticles,
        nbOnPage: formattedArticles.length,
        currentPage: inputs.page,
        totalPages: Math.ceil(totalArticles / inputs.limit),
        data: formattedArticles,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération des articles:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
