module.exports = {
  friendlyName: 'Obtenir une solution',
  description: 'Renvoie une solution spécifique par son ID ou son slug.',

  inputs: {
    identifier: {
      type: 'string',
      required: true,
      description: 'L\'ID ou le slug de la solution à récupérer.',
    },
    populate: {
      type: 'string',
      allowNull: true,
      description: 'Une liste de relations à peupler, séparées par des virgules (ex: faqTopics,partners,testimonies).',
    },
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'La solution a été trouvée et renvoyée avec succès.',
      responseType: 'ok',
    },
    notFound: {
      statusCode: 404,
      description: 'Aucune solution trouvée avec l\'identifiant fourni.',
    },
    badRequest: {
      statusCode: 400,
      description: 'Paramètre de population invalide.',
      responseType: 'badRequest',
    },
    serverError: {
      statusCode: 500,
      description: 'Une erreur serveur inattendue s\'est produite.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    try {
      // Récupérer les attributs du modèle et filtrer les collections (relations)
      const allAttributes = sails.models.solution.attributes;
      const allowedPopulations = Object.keys(allAttributes).filter(
        key => allAttributes[key].collection
      );

      let populateRelations = [];

      // Traiter le paramètre populate si fourni
      if (inputs.populate) {
        populateRelations = inputs.populate.split(',').map(r => r.trim());
        const invalidPopulations = populateRelations.filter(
          rel => !allowedPopulations.includes(rel)
        );

        // Vérifier si des relations invalides ont été demandées
        if (invalidPopulations.length > 0) {
          return exits.badRequest({
            success: false,
            message: 'Paramètre de population invalide.',
            invalidParams: invalidPopulations,
            allowedParams: allowedPopulations,
          });
        }
      }

      // Construire la requête de base (recherche par ID ou slug)
      let query = Solution.findOne({
        or: [
          { id: inputs.identifier },
          { slug: inputs.identifier }
        ]
      });

      // Ajouter les populations demandées
      for (const relation of populateRelations) {
        query = query.populate(relation);
      }

      // Exécuter la requête
      const solution = await query;

      // Vérifier si la solution existe
      if (!solution) {
        return exits.notFound({
          success: false,
          message: 'Solution non trouvée.'
        });
      }

      // Renvoyer la solution avec les informations de population
      return exits.success({
        success: true,
        message: 'Solution récupérée avec succès.',
        data: solution,
        populated: populateRelations.length > 0 ? populateRelations : null,
      });

    } catch (err) {
      sails.log.error('Erreur lors de la récupération de la solution:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message
      });
    }
  },
};
