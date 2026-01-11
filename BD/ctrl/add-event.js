module.exports = {
  friendlyName: 'Ajouter un événement',
  description: 'Ajoute un nouvel événement ou webinaire avec des validations spécifiques.',

  inputs: {
    type: {
      type: 'string',
      isIn: ['event', 'webinar'],
      required: true,
      description: 'Le type de l\'événement (event ou webinar).'
    },
    title: {
      type: 'string',
      required: true,
      description: 'Le titre de l\'événement.'
    },
    description: {
      type: 'string',
      required: true,
      description: 'Une brève description de l\'événement.'
    },
    format: {
      type: 'string',
      isIn: ['hybride', 'présential', 'online'],
      required: true,
      description: 'Le format de l\'événement.'
    },
    date: {
      type: 'string',
      required: true,
      description: 'La date de l\'événement (au format YYYY-MM-DD).'
    },
    time: {
      type: 'string',
      required: true,
      description: 'L\'heure de l\'événement (au format HH:MM).'
    },
    location: {
      type: 'string',
      description: 'Le lieu physique de l\'événement.'
    },
    link: {
      type: 'string',
      description: 'Le lien en ligne de l\'événement.'
    },
    ctaText: {
      type: 'string',
      description: 'Le texte de l\'appel à l\'action.'
    },
    ctaLink: {
      type: 'string',
      required: true,
      description: 'The URL for the call-to-action.'
    },
    agenda: {
      type: 'json',
      defaultsTo: [],
      description: 'La liste des points de l\'agenda de l\'événement.'
    },
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'L\'événement a été ajouté avec succès.',
      responseType: 'created',
    },
    badRequest: {
      statusCode: 400,
      description: 'Données d\'entrée invalides ou manquantes.',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Validation des règles 
      if (inputs.type === 'event' && (!inputs.agenda || inputs.agenda.length === 0)) {
        return exits.badRequest({
          message: 'Un "agenda" est requis pour les événements de type "event".'
        });
      }

      if (inputs.format === 'présential' && !inputs.location) {
        return exits.badRequest({
          message: 'Une "localisation" est requise pour les événements de format "Présentiel".'
        });
      }

      if (inputs.format === 'online' && !inputs.link) {
        return exits.badRequest({
          message: 'Un "link" est requis pour les événements de format "En ligne".'
        });
      }

      if (inputs.format === 'hybride' && !inputs.location && !inputs.link) {
        return exits.badRequest({
          message: 'Pour les événements "Hybride", soit une "localisation" soit un "link" est requis.'
        });
      }

      // Création de l'événement
      const newEvent = await EventModel.create({
        type: inputs.type,
        title: inputs.title,
        description: inputs.description,
        format: inputs.format,
        date: inputs.date,
        time: inputs.time,
        location: inputs.location,
        link: inputs.link,
        ctaText: inputs.ctaText,
        ctaLink: inputs.ctaLink,
        agenda: inputs.agenda,
      }).fetch();

      // Envoi de la réponse de succès
      return exits.success({
        success: true,
        message: 'Événement créé avec succès.',
        data: newEvent,
      });

    } catch (err) {
      sails.log.error('Erreur lors de la création de l\'événement:', err);
      if (err.name === 'ValidationError') {
        return exits.badRequest({ message: err.message });
      }
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
