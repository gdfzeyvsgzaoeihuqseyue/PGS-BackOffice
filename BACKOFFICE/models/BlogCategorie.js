module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      description: "Le nom de la catégorie de blog."
    },
    slug: {
      type: 'string',
      required: true,
      unique: true,
      description: "Le slug unique généré pour la catégorie de blog."
    },
    articles: {
      collection: 'Blog',
      via: 'category'
    }
  },
};