module.exports = {
  friendlyName: 'Ajouter une catégorie de blog',
  description: 'Ajoute une nouvelle catégorie de blog avec un slug et un nom uniques.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom de la nouvelle catégorie de blog.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'La catégorie a été ajoutée avec succès.',
      responseType: 'created',
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Le nom de la catégorie est déjà utilisé.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },
  
  fn: async function (inputs, exits) {
    try {
      // Vérifier si une catégorie avec le même nom existe déjà
      const existingCategory = await BlogCategorie.findOne({ name: inputs.name });
      if (existingCategory) {
        return exits.nameAlreadyExists({
          message: `Une catégorie avec le nom ${inputs.name} existe déjà. Veuillez en choisir un autre.`
        });
      }

      // Générer le slug unique en utilisant le helper
      const uniqueSlug = await sails.helpers.ids.slug(inputs.name, BlogCategorie);
      
      // Créer la nouvelle catégorie
      const newCategory = await BlogCategorie.create({
        name: inputs.name,
        slug: uniqueSlug, 
      }).fetch();
      
      return exits.success({
        success: true,
        message: 'Catégorie de blog créée avec succès.',
        data: newCategory,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout de la catégorie:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
