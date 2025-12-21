module.exports = {
  friendlyName: 'Mettre à jour un wiki',
  description: 'Met à jour une ressource wiki existante par son ID ou son slug.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du wiki à mettre à jour.',
    },
    name: {
      type: 'string',
      description: 'Le nouveau nom du wiki.',
    },
    description: {
      type: 'string',
      description: 'La nouvelle description du contenu.',
    },
    url: {
      type: 'string',
      description: 'La nouvelle URL de la ressource.',
    },
    additionalInfo: {
      type: 'string',
      allowNull: true,
      description: 'Nouvelles informations supplémentaires.',
    },
    platformId: {
      type: 'string',
      description: 'Le nouvel ID de la solution associée.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Le wiki a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune ressource wiki trouvée avec l\'ID fourni.',
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Ce nom de wiki est déjà utilisé par une autre ressource.',
    },
    platformNotFound: {
      statusCode: 404,
      description: 'La nouvelle solution spécifiée n\'existe pas.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      const wikiToUpdate = await SolutionWiki.findOne({ id: inputs.id });

      if (!wikiToUpdate) {
        return exits.notFound({
          message: 'Aucune ressource wiki trouvée avec l\'ID fourni.'
        });
      }

      // Préparer les données pour la mise à jour
      const updatedData = { ...inputs };
      delete updatedData.id;

      // Gérer la mise à jour du nom et du slug
      if (inputs.name && inputs.name !== wikiToUpdate.name) {
        const existingWiki = await SolutionWiki.findOne({
          name: inputs.name,
          id: { '!=': wikiToUpdate.id }
        });

        if (existingWiki) {
          return exits.nameAlreadyExists({
            message: `Le nom "${inputs.name}" est déjà utilisé par une autre ressource wiki.`
          });
        }
        const newSlug = await sails.helpers.ids.slug(inputs.name, SolutionWiki);
        updatedData.slug = newSlug;
      }

      // Vérifier si la nouvelle solution existe si platformId est fourni
      if (inputs.platformId) {
        const platform = await Solution.findOne({ id: inputs.platformId });
        if (!platform) {
          return exits.platformNotFound({ message: 'La nouvelle solution spécifiée n\'existe pas.' });
        }
        updatedData.platform = inputs.platformId;
      }

      const updatedWiki = await SolutionWiki.updateOne({ id: wikiToUpdate.id }).set(updatedData);

      if (!updatedWiki) {
        return exits.notFound({
          message: 'Le wiki à mettre à jour n\'a pas été trouvé.'
        });
      }

      const populatedWiki = await SolutionWiki.findOne({ id: updatedWiki.id }).populate('platform');

      const formattedWiki = {
        id: populatedWiki.id,
        name: populatedWiki.name,
        description: populatedWiki.description,
        url: populatedWiki.url,
        slug: populatedWiki.slug,
        additionalInfo: populatedWiki.additionalInfo,
        createdAt: populatedWiki.createdAt,
        updatedAt: populatedWiki.updatedAt,
        platform: {
          id: populatedWiki.platform ? populatedWiki.platform.id : null,
          name: populatedWiki.platform ? populatedWiki.platform.name : null,
          slug: populatedWiki.platform ? populatedWiki.platform.slug : null,
        },
      };

      return exits.success({
        success: true,
        message: 'Wiki mis à jour avec succès.',
        data: formattedWiki,
      });

    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour du wiki:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
