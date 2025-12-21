module.exports = {
  attributes: {
    slug: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Le slug unique de la ressource.'
    },
    name: {
      type: 'string',
      required: true,
      description: 'Nom de la ressource ou de l\'article wiki.'
    },
    description: {
      type: 'string',
      required: true,
      columnType: 'text',
      description: 'Une courte description du contenu.'
    },
    url: {
      type: 'string',
      required: true,
      isURL: true,
      description: 'L\'URL de la ressource.'
    },
    additionalInfo: {
      type: 'string',
      allowNull: true,
      description: 'Informations supplémentaires ou notes.'
    },
    platform: {
      model: 'Solution',
      description: 'La solution associée à cette ressource wiki.'
    }
  }
};
