module.exports = {
  attributes: {
    author: {
      type: 'string',
      required: true,
      maxLength: 100,
      description: 'Nom de la personne qui témoigne'
    },
    company: {
      type: 'string',
      maxLength: 150,
      allowNull: true,
      description: 'Nom de l\'entreprise ou organisation'
    },
    role: {
      type: 'string',
      maxLength: 100,
      allowNull: true,
      description: 'Poste ou fonction de la personne'
    },
    content: {
      type: 'string',
      required: true,
      columnType: 'text',
      description: 'Contenu du témoignage'
    },
    note: {
      type: 'number',
      min: 1,
      max: 5,
      allowNull: true,
      description: 'Note sur 5 étoiles'
    },
    avatar: {
      type: 'string',
      isURL: true,
      allowNull: true,
      description: 'URL de l\'avatar de la personne'
    },
    isPublished: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Le témoignage est-il publié ?'
    },
    isFeatured: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Témoignage mis en avant ?'
    },
    platform: {
      model: 'Solution',
      required: true,
      description: 'La solution associée à ce témoignage.'
    },
  }
};