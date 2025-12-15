module.exports = {
  friendlyName: 'Ajouter un auteur de blog',
  description: 'Ajoute un nouvel auteur de blog avec un slug généré et un nom uniques.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom de l\'auteur.',
    },
    avatar: {
      type: 'string',
      description: 'URL de l\'avatar de l\'auteur.',
    },
    role: {
      type: 'string',
      description: 'Le rôle de l\'auteur.',
    },
    bio: {
      type: 'string',
      description: 'La biographie de l\'auteur.',
    },
    social: {
      type: 'json',
      description: 'Liens vers les profils sociaux de l\'auteur.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'L\'auteur a été ajouté avec succès.',
      responseType: 'created',
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Un auteur avec ce nom existe déjà.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },
  
  fn: async function (inputs, exits) {
    try {
      // Vérifier si un auteur avec le même nom existe déjà 
      const existingAuthor = await BlogAuthor.findOne({ name: inputs.name });
      if (existingAuthor) {
        return exits.nameAlreadyExists({
          message: `Un auteur avec le nom ${inputs.name} existe déjà. Veuillez en choisir un autre.`
        });
      }

      // Le helper du slug
      const generatedSlug = await sails.helpers.ids.slug(inputs.name, BlogAuthor);
      
      const newAuthor = await BlogAuthor.create({
        name: inputs.name,
        slug: generatedSlug,
        avatar: inputs.avatar,
        role: inputs.role,
        bio: inputs.bio,
        social: inputs.social,
      }).fetch();
      
      return exits.success({
        success: true,
        message: 'Auteur de blog créé avec succès.',
        data: newAuthor,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout de l\'auteur:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
