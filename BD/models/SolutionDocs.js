module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom du document ou ressource.'
    },
    link: {
      type: 'string',
      required: true,
      isURL: true,
      description: 'L\'URL du document.'
    },
    platform: {
      model: 'Solution',
      description: 'La solution associée à ce document.'
    }
  }
};
