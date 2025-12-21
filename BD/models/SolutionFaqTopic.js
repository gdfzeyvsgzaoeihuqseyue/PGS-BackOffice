module.exports = {
  // tableName: 'solution_faq_topics',

  attributes: {
    name: {
      type: 'string',
      required: true,
      description: 'Le nom du sujet/topic de la FAQ.',
      example: 'Authentification'
    },
    slug: {
      type: 'string',
      description: 'Texte utilisé dans les URLs.',
      example: 'authentification'
    },
    description: {
      type: 'string',
      description: 'Description courte du topic.'
    },
    platform: {
      model: 'Solution',
      required: true,
      description: 'La solution/plateforme associée à ce sujet de FAQ.'
    },
    status: {
      type: 'string',
      description: 'Le statut du topic.',
      isIn: ['active', 'inactive'],
      defaultsTo: 'active'
    },
    faqs: {
      collection: 'SolutionFaqs',
      via: 'topic',
      description: 'La collection de FAQ qui appartiennent à ce sujet.'
    }
  }
};
