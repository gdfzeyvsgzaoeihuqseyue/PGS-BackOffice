module.exports = {
  friendlyName: 'Mettre à jour un article de blog',
  description: 'Met à jour un article de blog existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'article à mettre à jour.',
    },
    title: {
      type: 'string',
      description: 'Le nouveau titre de l\'article.',
    },
    excerpt: {
      type: 'string',
      description: 'Le nouveau résumé.',
    },
    content: {
      type: 'string',
      description: 'Le nouveau contenu.',
    },
    imageUrl: {
      type: 'string',
      description: 'La nouvelle URL de l\'image.',
    },
    authorId: {
      type: 'string',
      description: 'Le nouvel ID de l\'auteur.',
    },
    categoryId: {
      type: 'string',
      description: 'Le nouvel ID de la catégorie.',
    },
    tags: {
      type: 'json',
      description: 'Les nouveaux tags.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'article a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun article trouvé avec l\'ID ou l\'association fournie.',
    },
    badRequest: {
      statusCode: 400,
      description: 'Le titre de l\'article est déjà utilisé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const articleToUpdate = await Blog.findOne({ id: inputs.id });
      if (!articleToUpdate) {
        return exits.notFound({ message: 'Article non trouvé.' });
      }

      const updatedData = {
        title: inputs.title || articleToUpdate.title,
        excerpt: inputs.excerpt || articleToUpdate.excerpt,
        content: inputs.content || articleToUpdate.content,
        imageUrl: inputs.imageUrl || articleToUpdate.imageUrl,
        tags: inputs.tags || articleToUpdate.tags,
      };

      if (inputs.title) {
        updatedData.slug = updatedData.slug = await sails.helpers.ids.slug.with({
          text: inputs.title,
          model: Blog,
        });

        const existingArticleWithSlug = await Blog.findOne({
          slug: updatedData.slug,
          id: { '!=': inputs.id }
        });
        if (existingArticleWithSlug) {
          return exits.badRequest({ message: 'Un autre article avec ce titre existe déjà.' });
        }
      }

      if (inputs.authorId) {
        const author = await BlogAuthor.findOne({ id: inputs.authorId });
        if (!author) {
          return exits.notFound({ message: 'Auteur non trouvé.' });
        }
        updatedData.author = inputs.authorId;
      }

      if (inputs.categoryId) {
        const category = await BlogCategorie.findOne({ id: inputs.categoryId });
        if (!category) {
          return exits.notFound({ message: 'Catégorie non trouvée.' });
        }
        updatedData.category = inputs.categoryId;
      }

      const updatedArticle = await Blog.updateOne({ id: inputs.id }).set(updatedData);

      if (!updatedArticle) {
        return exits.notFound({ message: 'Article non trouvé.' });
      }

      return exits.success({
        success: true,
        message: 'Article mis à jour avec succès.',
        data: updatedArticle,
      });
    } catch (err) {
      if (err.code === 'E_UNIQUE') {
        return exits.badRequest({
          message: 'Le titre de l\'article est déjà utilisé. Veuillez en choisir un autre.'
        });
      }
      sails.log.error('Erreur lors de la mise à jour de l\'article:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
