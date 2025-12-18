module.exports = {
  friendlyName: 'Obtenir un article',
  description: 'Renvoie un article de blog spécifique par son ID ou slug avec les détails de son auteur et sa catégorie.',

  inputs: {
    identifier: {
      type: 'string',
      required: true,
      description: 'L\'ID ou le slug de l\'article à récupérer.',
    },
    excludeView: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Si vrai, n\'incrémente pas le compteur de vues (ex: pour l\'édition admin).'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'article a été trouvé et renvoyé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun article trouvé avec l\'identifiant fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Récupérer l'article par ID ou slug
      const article = await Blog.findOne({
        or: [
          { id: inputs.identifier },
          { slug: inputs.identifier }
        ]
      });

      if (!article) {
        return exits.notFound({ message: 'Article non trouvé.' });
      }

      // Incrémenter les vues seulement si excludeView est faux
      if (!inputs.excludeView) {
        await Blog.updateOne({ id: article.id }).set({
          views: (article.views || 0) + 1
        });
      }

      const articleId = article.id; // Use ID from initial fetch as updateOne returns array or specific object depending on adapter version, safer to stick to found ID


      // Populer les relations
      const populatedArticle = await Blog.findOne({ id: article.id })
        .populate('author')
        .populate('category');

      const formattedArticle = {
        id: populatedArticle.id,
        slug: populatedArticle.slug,
        title: populatedArticle.title,
        excerpt: populatedArticle.excerpt,
        content: populatedArticle.content,
        imageUrl: populatedArticle.imageUrl,
        tags: populatedArticle.tags,
        views: populatedArticle.views,
        createdAt: populatedArticle.createdAt,
        updatedAt: populatedArticle.updatedAt,
        category: {
          id: populatedArticle.category ? populatedArticle.category.id : null,
          name: populatedArticle.category ? populatedArticle.category.name : null,
          slug: populatedArticle.category ? populatedArticle.category.slug : null,
        },
        author: {
          id: populatedArticle.author ? populatedArticle.author.id : null,
          name: populatedArticle.author ? populatedArticle.author.name : null,
          slug: populatedArticle.author ? populatedArticle.author.slug : null,
        },
      };

      return exits.success({
        success: true,
        message: 'Article récupéré avec succès.',
        data: formattedArticle,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération de l\'article:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
