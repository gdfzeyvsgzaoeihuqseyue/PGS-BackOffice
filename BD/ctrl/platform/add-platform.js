module.exports = {
  friendlyName: 'Ajouter une solution',
  description: 'Ajoute une nouvelle solution avec un slug unique.',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Le nom de la solution (ex: SuitOps).',
    },
    logo: {
      type: 'string',
      allowNull: true,
      description: "L'URL du logo mobile de la solution.",
    },
    logoDesk: {
      type: 'string',
      description: "L'URL du logo de bureau de la solution.",
      allowNull: true,
    },
    category: {
      type: 'string',
      description: 'La catégorie de la solution.',
    },
    description: {
      type: 'string',
      description: 'Une courte description de la solution.',
    },
    content: {
      type: 'string',
      description: 'Le contenu détaillé de la solution.',
    },
    disabled: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Indique si la solution est désactivée ou non.',
    },
    allowAuth: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Indique si la plateforme autorise les authentifications.',
    },
    authType: {
      type: 'string',
      isIn: ['all', 'user', 'learner'],
      allowNull: true,
      description: "Type d'authentification autorisé (all, user, learner). Obligatoire si allowAuth est true.",
    },
    ctaText: {
      type: 'string',
      description: "Le texte du bouton d'appel à l'action.",
    },
    ctaLink: {
      type: 'string',
      description: "Le lien du bouton d'appel à l'action.",
    },
    features: {
      type: 'json',
      defaultsTo: [],
      description: 'Une liste de fonctionnalités de la solution.',
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'La solution a été ajoutée avec succès.',
      responseType: 'created',
    },
    nameAlreadyExists: {
      statusCode: 400,
      description: 'Ce nom de solution est déjà utilisé.',
    },
    invalidAuthType: {
      statusCode: 400,
      description: 'authType est requis lorsque allowAuth est true.',
    },
    serverError: {
      statusCode: 500,
      description: "Une erreur serveur inattendue s'est produite.",
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Gestion stricte allowAuth / authType
      if (inputs.allowAuth === true && !inputs.authType) {
        return exits.invalidAuthType({
          message: 'Le champ "authType" est obligatoire lorsque allowAuth est true.'
        });
      }

      if (inputs.allowAuth === false && (inputs.authType !== undefined && inputs.authType !== null)) {
        return exits.invalidAuthType({
          message: 'Impossible de définir "authType" lorsque allowAuth est false.'
        });
      }

      // Vérifier si une solution avec le même nom existe déjà
      const existingPlatform = await Solution.findOne({ name: inputs.name });
      if (existingPlatform) {
        return exits.nameAlreadyExists({
          message: `Le nom "${inputs.name}" est déjà utilisé par une autre solution.`,
        });
      }

      // Générer un slug unique
      const uniqueSlug = await sails.helpers.ids.slug(inputs.name, Solution);

      // Créer la nouvelle solution
      const newPlatform = await Solution.create({
        slug: uniqueSlug,
        name: inputs.name,
        logo: inputs.logo,
        logoDesk: inputs.logoDesk,
        category: inputs.category,
        description: inputs.description,
        content: inputs.content,
        disabled: inputs.disabled,
        allowAuth: inputs.allowAuth,
        authType: inputs.authType,
        ctaText: inputs.ctaText,
        ctaLink: inputs.ctaLink,
        features: inputs.features,
      }).fetch();

      // Renvoyer le succès
      return exits.success({
        success: true,
        message: 'Solution créée avec succès.',
        data: newPlatform,
        note: 'Les relations (docs, faqTopics, tutorials, etc.) peuvent maintenant être ajoutées via leurs endpoints respectifs.',
      });

    } catch (err) {
      sails.log.error('Erreur lors de l\'ajout de la solution:', err);
      return exits.serverError({
        message: "Une erreur serveur inattendue s'est produite.",
        error: err.message,
      });
    }
  },
};
