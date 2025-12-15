module.exports = {
  friendlyName: 'Ajouter un article de blog',
  description: 'Ajoute un nouvel article de blog avec un slug généré et des associations aux catégories.',

  inputs: {
    title: {
      type: 'string',
      required: true,
      description: 'Le titre de l\'article.',
    },
    excerpt: {
      type: 'string',
      description: 'Un court résumé de l\'article.',
    },
    content: {
      type: 'string',
      required: true,
      description: 'Le contenu de l\'article en HTML.',
    },
    imageUrl: {
      type: 'string',
      description: 'URL de l\'image de couverture.',
    },
    authorId: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'auteur de l\'article.',
    },
    categoryId: {
      type: 'string',
      required: true,
      description: 'L\'ID de la catégorie de l\'article.',
    },
    tags: {
      type: 'json',
      defaultsTo: [],
      description: 'Une liste de tags associés à l\'article.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'L\'article a été ajouté avec succès.',
      responseType: 'created',
    },
    authorNotFound: {
      statusCode: 404,
      description: 'Auteur non trouvé.',
    },
    categoryNotFound: {
      statusCode: 404,
      description: 'Catégorie non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const author = await BlogAuthor.findOne({ id: inputs.authorId });
      if (!author) {
        return exits.authorNotFound({
          message: 'L\'auteur spécifié n\'existe pas.'
        });
      }

      const category = await BlogCategorie.findOne({ id: inputs.categoryId });
      if (!category) {
        return exits.categoryNotFound({
          message: 'La catégorie spécifiée n\'existe pas.'
        });
      }

      // Le helper slug
      const uniqueSlug = await sails.helpers.ids.slug.with({
        text: inputs.title,
        model: Blog,
      });

      const newArticle = await Blog.create({
        title: inputs.title,
        slug: uniqueSlug,
        excerpt: inputs.excerpt,
        content: inputs.content,
        imageUrl: inputs.imageUrl,
        tags: inputs.tags,
        author: inputs.authorId,
        category: inputs.categoryId,
      }).fetch();

      const populatedArticle = await Blog.findOne({ id: newArticle.id })
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
        date: populatedArticle.createdAt,
        author: {
          id: populatedArticle.author.id,
          name: populatedArticle.author.name,
          slug: populatedArticle.author.slug,
        },
        category: {
          id: populatedArticle.category.id,
          name: populatedArticle.category.name,
          slug: populatedArticle.category.slug,
        }
      };

      return exits.success({
        success: true,
        message: 'Article de blog créé avec succès.',
        data: formattedArticle,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout de l\'article:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
