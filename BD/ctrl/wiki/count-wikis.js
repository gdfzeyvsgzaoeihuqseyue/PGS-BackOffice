module.exports = {
  friendlyName: 'Compter les wikis',
  description: 'Renvoie le nombre de wikis par lettre et par solution.',

  inputs: {},

  exits: {
    success: {
      description: 'Décompte des wikis réussi.',
    },
    serverError: {
      description: 'Erreur interne du serveur.',
      responseType: 'serverError',
    },
  },

  fn: async function(inputs, exits) {
    try {
      // Compter par première lettre du nom
      const wikisByLetter = await SolutionWiki.find();
      const countsByLetter = wikisByLetter.reduce((acc, wiki) => {
        const firstLetter = wiki.name ? wiki.name.charAt(0).toUpperCase() : '#';
        if (!acc[firstLetter]) {
          acc[firstLetter] = 0;
        }
        acc[firstLetter]++;
        return acc;
      }, {});

      // Compter par solution
      const wikisByPlatform = await SolutionWiki.find().populate('platform');
      const countsByPlatform = wikisByPlatform.reduce((acc, wiki) => {
        const platformName = wiki.platform ? wiki.platform.name : 'Inconnue';
        if (!acc[platformName]) {
          acc[platformName] = {
            id: wiki.platform ? wiki.platform.id : null,
            count: 0
          };
        }
        acc[platformName].count++;
        return acc;
      }, {});
      
      return exits.success({
        countsByLetter: countsByLetter,
        countsByPlatform: countsByPlatform,
      });

    } catch (err) {
      sails.log.error('Erreur lors du décompte des wikis:', err);
      return exits.serverError({
        message: 'Une erreur serveur inattendue s\'est produite.',
        error: err.message,
      });
    }
  },
};
