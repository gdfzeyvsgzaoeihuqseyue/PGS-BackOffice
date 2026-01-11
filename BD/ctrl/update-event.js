module.exports = {
  friendlyName: 'Mettre à jour un événement',
  description: 'Met à jour un événement existant par son ID.',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'événement à mettre à jour.',
    },
    type: {
      type: 'string',
      isIn: ['event', 'webinar'],
      description: 'Le type de l\'événement (event ou webinar).',
    },
    title: {
      type: 'string',
      description: 'Le titre de l\'événement.',
    },
    description: {
      type: 'string',
      description: 'Une brève description de l\'événement.',
    },
    format: {
      type: 'string',
      isIn: ['hybride', 'présential', 'online'],
      description: 'Le format de l\'événement.',
    },
    date: {
      type: 'string',
      description: 'La date de l\'événement (AAAA-MM-JJ).',
    },
    time: {
      type: 'string',
      description: 'L\'heure de l\'événement (HH:MM).',
    },
    location: {
      type: 'string',
      description: 'La localisation physique de l\'événement.',
    },
    link: {
      type: 'string',
      description: 'Le lien en ligne de l\'événement.',
    },
    ctaText: {
      type: 'string',
      description: 'Le texte du bouton d\'appel à l\'action.',
    },
    ctaLink: {
      type: 'string',
      description: 'L\'URL du bouton d\'appel à l\'action.',
    },
    agenda: {
      type: 'json',
      description: 'Une liste des points de l\'agenda.',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'L\'événement a été mis à jour avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucun événement trouvé avec l\'ID fourni.',
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
      const existingEvent = await EventModel.findOne({ id: inputs.id });
      if (!existingEvent) {
        return exits.notFound({
          message: 'Événement non trouvé.'
        });
      }

      // Fusionner les données existantes avec les nouvelles
      const dataToUpdate = { ...existingEvent, ...inputs };
      delete dataToUpdate.id;

      // Re-valider les règles d'affaires avant la mise à jour
      if (dataToUpdate.type === 'event' && (!dataToUpdate.agenda || dataToUpdate.agenda.length === 0)) {
        return exits.badRequest({
          message: 'Un "agenda" est requis pour les événements de type "event".'
        });
      }

      if (dataToUpdate.format === 'présential' && !dataToUpdate.location) {
        return exits.badRequest({
          message: 'Une "localisation" est requise pour les événements de format "Présentiel".'
        });
      }

      if (dataToUpdate.format === 'online' && !dataToUpdate.link) {
        return exits.badRequest({
          message: 'Un "link" est requis pour les événements de format "En ligne".'
        });
      }

      if (dataToUpdate.format === 'hybride' && !dataToUpdate.location && !dataToUpdate.link) {
        return exits.badRequest({
          message: 'Pour les événements "Hybride", soit une "localisation" soit un "link" est requis.'
        });
      }

      const updatedEvent = await EventModel.updateOne({ id: inputs.id }).set(dataToUpdate);

      if (!updatedEvent) {
        return exits.notFound({
          message: 'Événement non trouvé après la mise à jour.'
        });
      }

      return exits.success({
        success: true,
        message: 'Événement mis à jour avec succès.',
        data: updatedEvent,
      });
    } catch (err) {
      sails.log.error('Erreur lors de la mise à jour de l\'événement:', err);
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
