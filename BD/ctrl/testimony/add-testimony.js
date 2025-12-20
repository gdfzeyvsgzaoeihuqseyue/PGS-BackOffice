module.exports = {
  friendlyName: 'Ajouter un témoignage à une solution',
  description: 'Ajoute un nouveau témoignage pour une solution spécifique.',

  inputs: {
    author: {
      type: 'string',
      required: true,
      description: 'Nom de la personne qui témoigne',
    },
    company: {
      type: 'string',
      description: 'Nom de l\'entreprise ou organisation',
    },
    role: {
      type: 'string',
      description: 'Poste ou fonction de la personne',
    },
    content: {
      type: 'string',
      required: true,
      description: 'Contenu du témoignage',
    },
    note: {
      type: 'number',
      min: 1,
      max: 5,
      description: 'Note sur 5 étoiles',
    },
    avatar: {
      type: 'string',
      isURL: true,
      description: 'URL de l\'avatar de la personne',
    },
    isPublished: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Le témoignage est-il publié ?',
    },
    isFeatured: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Témoignage mis en avant ?',
    },
    platformId: {
      type: 'string',
      required: true,
      description: 'ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Le témoignage a été ajouté avec succès.',
      responseType: 'created',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'Solution non trouvée.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que la solution existe
      const platform = await Solution.findOne({ id: inputs.platformId });
      if (!platform) {
        return exits.platformNotFound({
          message: 'La solution spécifiée n\'existe pas.'
        });
      }

      // Créer le nouveau témoignage
      const newTestimony = await SolutionTestimonies.create({
        author: inputs.author,
        company: inputs.company,
        role: inputs.role,
        content: inputs.content,
        note: inputs.note,
        avatar: inputs.avatar,
        isPublished: inputs.isPublished,
        isFeatured: inputs.isFeatured,
        platform: inputs.platformId,
      }).fetch();

      return exits.success({
        success: true,
        message: 'Témoignage ajouté avec succès.',
        data: newTestimony,
      });
    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout du témoignage:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
