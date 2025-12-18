module.exports = {
  friendlyName: 'Obtenir une catégorie',
  description: 'Renvoie une catégorie de blog spécifique par son slug, y compris ses articles associés.',
  
  inputs: {
    identifier: {
      type: 'string',
      required: true,
      description: 'L\'ID ou slug de la catégorie de blog à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La catégorie a été trouvée et renvoyée avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune catégorie trouvée avec le slug fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Récupérer la catégorie avec ses articles
      const category = await BlogCategorie.findOne({
        or: [
          { id: inputs.identifier },
          { slug: inputs.identifier }
        ]
      }).populate('articles');
      
      if (!category) {
        return exits.notFound({
          message: 'Catégorie non trouvée.',
        });
      }

      // Compter le nombre d’articles liés
      const articleCount = await Blog.count({ category: category.id });

      // Ajouter la propriété au retour
      const categoryWithCount = {
        articleCount,
        ...category,        
      };
      
      return exits.success({
        success: true,
        message: 'Catégorie et ses articles récupérés avec succès.',
        data: categoryWithCount,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération de la catégorie:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
