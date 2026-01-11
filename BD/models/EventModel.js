module.exports = {
  attributes: {
    type: {
      type: 'string',
      isIn: ['event', 'webinar'],
      required: true,
      description: 'Le type de l\'événement (event or webinar).'
    },
    title: {
      type: 'string',
      required: true,
      description: 'Le titre de l\'événement.'
    },
    description: {
      type: 'string',
      required: true,
      columnType: 'text',
      description: 'Une brève description de l\'événement.'
    },
    format: {
      type: 'string',
      isIn: ['hybride', 'présential', 'online'],
      required: true,
      description: 'Le format de l\'événement (Hybride, Présential, ou Online).'
    },
    date: {
      type: 'string',
      required: true,
      description: 'La date de l\'événement au format "YYYY-MM-DD".'
    },
    time: {
      type: 'string',
      required: true,
      description: 'L\'heure de l\'événement au format "HH:MM".'
    },
    location: {
      type: 'string',
      allowNull: true,
      description: 'Le lieu physique de l\'événement.'
    },
    link: {
      type: 'string',
      allowNull: true,
      description: 'Le lien en ligne de l\'événement.'
    },
    ctaText: {
      type: 'string',
      defaultsTo: 'S\'inscrire',
      description: 'Le texte de l\'appel à l\'action pour l\'événement.'
    },
    ctaLink: {
      type: 'string',
      required: true,
      description: 'L\'URL de l\'appel à l\'action.'
    },
    agenda: {
      type: 'json',
      defaultsTo: [],
      description: 'La liste des points à l\'ordre du jour de l\'événement.',
    }
  },

  // Lifecycle callback pour validation avancée
  beforeCreate: async function (valuesToSet, proceed) {
    if (valuesToSet.type === 'event' && (!valuesToSet.agenda || valuesToSet.agenda.length === 0)) {
      return proceed(new Error('L\'agenda est requis pour les événements de type "event".'));
    }

    if (valuesToSet.format === 'présential' && !valuesToSet.location) {
      return proceed(new Error('La localisation est requise pour les événements de format "Présentiel".'));
    }

    if (valuesToSet.format === 'online' && !valuesToSet.link) {
      return proceed(new Error('Le lien en ligne est requis pour les événements de format "En ligne".'));
    }

    if (valuesToSet.format === 'hybride' && !valuesToSet.location && !valuesToSet.link) {
      return proceed(new Error('Pour les événements "Hybride", la localisation ou le lien en ligne sont requis.'));
    }

    return proceed();
  },
};
