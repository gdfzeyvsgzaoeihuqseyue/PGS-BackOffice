module.exports = {
  friendlyName: 'Obtenir un auteur',
  description: 'Renvoie un auteur de blog spécifique par son slug, y compris ses articles.',

  inputs: {
    identifier: {
      type: 'string',
      required: true,
      description: 'L\ID ou slug de l\'auteur à récupérer.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'auteur a été trouvé et renvoyé avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun auteur trouvé avec le slug fourni.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },
  
  fn: async function (inputs, exits) {
    try {
       // Récupérer l'auteur avec ses articles
      const author = await BlogAuthor.findOne({
        or: [
          { id: inputs.identifier },
          { slug: inputs.identifier }
        ]
      }).populate('articles');
      
      if (!author) {
        return exits.notFound({
          message: 'Auteur non trouvé.',
        });
      }
      
      // Compter le nombre d’articles liés
      const articleCount = await Blog.count({ author: author.id });

      // Ajouter la propriété au retour
      const authorWithCount = {
        articleCount,
        ...author,
      };


      return exits.success({
        success: true,
        message: 'Auteur et ses articles récupérés avec succès.',
        data: authorWithCount,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la récupération de l\'auteur:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
