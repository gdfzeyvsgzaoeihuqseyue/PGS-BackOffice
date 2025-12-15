module.exports = {
  friendlyName: 'Mettre à jour un auteur de blog',
  description: 'Met à jour un auteur de blog existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'auteur à mettre à jour.',
    },
    name: {
      type: 'string',
      required: true,
      description: 'Le nouveau nom de l\'auteur.',
    },
    avatar: {
      type: 'string',
      description: 'La nouvelle URL de l\'avatar.',
    },
    role: {
      type: 'string',
      description: 'Le nouveau rôle de l\'auteur.',
    },
    bio: {
      type: 'string',
      description: 'La nouvelle biographie.',
    },
    social: {
      type: 'json',
      description: 'Les nouveaux liens vers les profils sociaux.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'auteur a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun auteur trouvé avec l\'ID fourni.',
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Le nom de l\'auteur est déjà utilisé par un autre auteur.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Trouver l'auteur existant par son ID
      const existingAuthor = await BlogAuthor.findOne({ id: inputs.id });
      if (!existingAuthor) {
        return exits.notFound({
          message: 'Auteur non trouvé.',
        });
      }

      let newSlug = existingAuthor.slug; 

      // Vérifier si le nom a été modifié
      if (inputs.name !== existingAuthor.name) {
        // Vérifier si le nouveau nom est déjà pris par un autre auteur
        const nameIsTaken = await BlogAuthor.findOne({ name: inputs.name, id: { '!=': inputs.id } });
        if (nameIsTaken) {
          return exits.nameAlreadyExists({
            message: `Le nom "${inputs.name}" est déjà utilisé par un autre auteur.`
          });
        }
        // Si le nom est unique, générer un nouveau slug
        newSlug = await sails.helpers.ids.slug(inputs.name, BlogAuthor);
      }

      // 3. Préparer les données à mettre à jour
      const dataToUpdate = {
        name: inputs.name,
        slug: newSlug, 
        avatar: inputs.avatar || existingAuthor.avatar,
        role: inputs.role || existingAuthor.role,
        bio: inputs.bio || existingAuthor.bio,
        social: inputs.social || existingAuthor.social,
      };

      // Mettre à jour l'auteur
      const updatedAuthor = await BlogAuthor.updateOne({ id: inputs.id }).set(dataToUpdate);

      if (!updatedAuthor) {
        return exits.notFound({
          message: 'Auteur non trouvé après la mise à jour.',
        });
      }

      return exits.success({
        success: true,
        message: 'Auteur mis à jour avec succès.',
        data: updatedAuthor,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour de l\'auteur:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
