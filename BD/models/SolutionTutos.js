module.exports = {
  attributes: {
    title: {
      type: 'string',
      required: true,
      description: 'Titre du tutoriel.'
    },
    description: {
      type: 'string',
      description: 'Courte description du tutoriel.'
    },
    time: {
      type: 'string',
      allowNull: true,
      description: 'La durée du tutoriel (ex: 5min, 12:30).'
    },
    link: {
      type: 'string',
      required: true,
      description: 'Lien vers la vidéo ou le guide.'
    },
    platform: {
      model: 'Solution',
      required: true,
      description: 'La solution associée à ce tutoriel.'
    }
  }
};
