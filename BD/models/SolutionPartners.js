module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom ou organisation du partenaire',
    },
    website: {
      type: 'string',
      isURL: true,
      description: 'URL du site web du partenaire',
    },
    logo: {
      type: 'string',
      isURL: true,
      description: 'URL du logo du partenaire',
    },
    platform: {
      model: 'Solution',
      required: true,
      description: 'La solution associée à ce document.'
    }
  }
};
