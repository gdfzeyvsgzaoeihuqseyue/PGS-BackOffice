module.exports = {
  friendlyName: 'Mettre à jour une solution',
  description: 'Met à jour une solution existante par son ID et inclut une option pour peupler ses relations.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de la solution à mettre à jour.',
    },
    name: {
      type: 'string',
      description: 'Le nouveau nom de la solution.',
    },
    logo: {
      type: 'string',
      description: 'La nouvelle URL du logo mobile.',
    },
    logoDesk: {
      type: 'string',
      allowNull: true,
      description: 'La nouvelle URL du logo desktop.',
    },
    category: {
      type: 'string',
      description: 'La nouvelle catégorie de la solution.',
    },
    description: {
      type: 'string',
      description: 'La nouvelle description.',
    },
    content: {
      type: 'string',
      description: 'Le nouveau contenu.',
    },
    disabled: {
      type: 'boolean',
      description: 'Le nouveau statut de la solution.',
    },
    allowAuth: {
      type: 'boolean',
      description: 'Indique si la plateforme autorise les authentifications.',
    },
    authType: {
      type: 'string',
      isIn: ['all', 'user', 'learner'],
      description: "Type d'authentification autorisé (all, user, learner). Obligatoire si allowAuth est true.",
    },
    ctaText: {
      type: 'string',
      description: 'Le nouveau texte du CTA.',
    },
    ctaLink: {
      type: 'string',
      description: 'Le nouveau lien du CTA.',
    },
    features: {
      type: 'json',
      description: 'La nouvelle liste de fonctionnalités.',
    },
    populate: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Indique si les relations doivent être peuplées.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La solution a été mise à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune solution trouvée avec l\'identifiant fourni.',
    },
    badRequest: {
      statusCode: 400,
      description: 'Une des valeurs fournies est invalide.'
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Ce nom de solution est déjà utilisé par une autre solution.',
    },
    invalidAuthType: {
      statusCode: 400,
      description: 'authType est requis lorsque allowAuth est true.',
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
      const solutionToUpdate = await Solution.findOne({
        id: inputs.id
      });

      if (!solutionToUpdate) {
        return exits.notFound({
          message: 'Aucune solution trouvée avec l\'identifiant fourni.'
        });
      }

      // Déterminer les nouvelles valeurs après update partiel
      const newAllowAuth = inputs.allowAuth !== undefined ? inputs.allowAuth : solutionToUpdate.allowAuth;
      const newAuthType = inputs.authType !== undefined ? inputs.authType : solutionToUpdate.authType;

      // allowAuth = true => authType obligatoire
      if (newAllowAuth === true && !newAuthType) {
        return exits.invalidAuthType({
          message: 'Le champ "authType" est obligatoire lorsque "allowAuth" est true.'
        });
      }

      // allowAuth = false => authType DOIT être absent
      if (newAllowAuth === false && (inputs.authType !== undefined && inputs.authType !== null)) {
        return exits.invalidAuthType({
          message: 'Impossible de définir "authType" lorsque "allowAuth" est false.'
        });
      }

      // Préparer les données de mise à jour
      const updatedData = { ...inputs };
      delete updatedData.id;
      delete updatedData.populate;

      // Vérifier l'unicité du nom si modifié
      if (inputs.name && inputs.name !== solutionToUpdate.name) {
        const existingSolution = await Solution.findOne({
          name: inputs.name,
          id: { '!=': solutionToUpdate.id }
        });

        if (existingSolution) {
          return exits.nameAlreadyExists({
            message: `Le nom "${inputs.name}" est déjà utilisé par une autre solution.`
          });
        }

        // Générer un nouveau slug si le nom change
        const newSlug = await sails.helpers.ids.slug(inputs.name, Solution);
        updatedData.slug = newSlug;
      }

      // Mettre à jour la solution
      const updatedSolution = await Solution.updateOne({
        id: solutionToUpdate.id
      }).set(updatedData);

      if (!updatedSolution) {
        return exits.notFound({
          message: 'La solution à mettre à jour n\'a pas été trouvée (problème d\'ID).'
        });
      }

      // Peupler la réponse si demandé
      if (inputs.populate) {
        const populatedSolution = await Solution.findOne({
          id: updatedSolution.id
        })
          .populate('docs')
          .populate('faqTopics')
          .populate('tutorials')
          .populate('wiki')
          .populate('partners')
          .populate('testimonies');

        return exits.success({
          success: true,
          message: 'Solution mise à jour avec succès.',
          data: populatedSolution,
        });
      }

      return exits.success({
        success: true,
        message: 'Solution mise à jour avec succès.',
        data: updatedSolution,
      });

    } catch (err) {
      if (err.code === 'E_UNIQUE') {
        return exits.badRequest({
          message: 'Une des valeurs fournies (nom ou slug) est déjà utilisée.'
        });
      }
      sails.log.error('Erreur lors de la mise à jour de la solution:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
