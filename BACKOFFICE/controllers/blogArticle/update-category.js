module.exports = {
  friendlyName: 'Mettre à jour une catégorie de blog',
  description: 'Met à jour une catégorie de blog existante par son ID.',
  
  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de la catégorie de blog à mettre à jour.',
    },
    name: {
      type: 'string',
      required: true,
      description: 'Le nouveau nom de la catégorie de blog.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La catégorie a été mise à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune catégorie trouvée avec l\'ID fourni.',
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Le nom de la catégorie est déjà utilisé par une autre catégorie.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Trouver la catégorie existante par son ID
      const existingCategory = await BlogCategorie.findOne({ id: inputs.id });
      if (!existingCategory) {
        return exits.notFound({
          message: 'Catégorie non trouvée.',
        });
      }

      let newSlug = existingCategory.slug; 

      // Vérifier si le nom a été modifié
      if (inputs.name !== existingCategory.name) {
        // Vérifier si le nouveau nom est déjà pris par une autre catégorie
        const nameIsTaken = await BlogCategorie.findOne({ name: inputs.name, id: { '!=': inputs.id } });
        if (nameIsTaken) {
          return exits.nameAlreadyExists({
            message: `Le nom "${inputs.name}" est déjà utilisé par une autre catégorie.`
          });
        }
        // Si le nom est unique, générer un nouveau slug
        newSlug = await sails.helpers.ids.slug(inputs.name, BlogCategorie);
      }
      
      // Mettre à jour la catégorie
      const updatedCategory = await BlogCategorie.updateOne({ id: inputs.id }).set({
        name: inputs.name,
        slug: newSlug,
      });
      
      if (!updatedCategory) {
        return exits.notFound({
          message: 'Catégorie non trouvée après la mise à jour.',
        });
      }
      
      return exits.success({
        success: true,
        message: 'Catégorie mise à jour avec succès.',
        data: updatedCategory,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour de la catégorie:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
