module.exports = {
  attributes: {
    slug: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Le slug unique généré à partir du nom de la solution (ex: suitops).'
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Le nom de la solution (ex: SuitOps).'
    },
    logo: {
      type: 'string',
      allowNull: true,
      description: 'L\'URL du logo mobile de la solution.'
    },
    logoDesk: {
      type: 'string',
      description: 'L\'URL du logo de bureau de la solution.',
      allowNull: true,
    },
    category: {
      type: 'string',
      description: 'La catégorie de la solution.',
    },
    description: {
      type: 'string',
      description: 'Une courte description de la solution.',
      columnType: 'text',
    },
    content: {
      type: 'string',
      columnType: 'longtext',
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
      description: 'Type d\'authentification autorisé (all, user, learner). Obligatoire si allowAuth est true.',
    },
    ctaText: {
      type: 'string',
      description: 'Le texte du bouton d\'appel à l\'action.',
    },
    ctaLink: {
      type: 'string',
      description: 'Le lien du bouton d\'appel à l\'action.',
    },
    features: {
      type: 'json',
      defaultsTo: [],
      description: 'Une liste de fonctionnalités de la solution.'
    },
    docs: {
      collection: 'SolutionDocs',
      via: 'platform',
      description: 'Une liste de liens vers la documentation.'
    },
    faqTopics: {
      collection: 'SolutionFaqTopic',
      via: 'platform',
      description: 'Une liste de sujets (topics) de FAQ pour cette solution.'
    },
    tutorials: {
      collection: 'SolutionTutos',
      via: 'platform',
      description: 'Une liste de tutoriels vidéo ou écrits.'
    },
    wiki: {
      collection: 'SolutionWiki',
      via: 'platform',
      description: 'Une liste de ressource documentaire.'
    },
    partners: {
      collection: 'SolutionPartners',
      via: 'platform',
      description: 'Une liste de partenaires.'
    },
    testimonies: {
      collection: 'SolutionTestimonies',
      via: 'platform',
      description: 'Une liste de témoignages.'
    }
  },
};
