module.exports = {
  attributes: {
    slug: {
      type: 'string',
      required: true,
      unique: true,
      description: "Le slug unique généré à partir du titre de l'article."
    },
    title: {
      type: 'string',
      required: true,
      unique: true,
      description: "Le titre de l'article."
    },
    excerpt: {
      type: 'string',
      description: "Un court résumé de l'article.",
      columnType: 'text',
    },
    content: {
      type: 'string',
      required: true,
      description: "Le contenu complet de l'article en HTML.",
      columnType: 'longtext',
    },
    imageUrl: {
      type: 'string',
      description: "L'URL de l'image de couverture de l'article."
    },
    tags: {
      type: 'json',
      defaultsTo: [],
      description: "Une liste de tags associés à l'article."
    },
    author: {
      model: 'BlogAuthor',
      required: true,
      description: "L'ID de l'auteur de l'article."
    },
    category: {
      model: 'BlogCategorie',
      required: true,
      description: "L'ID de la catégorie de l'article."
    },
    views: {
      type: 'number',
      defaultsTo: 0,
      description: "Le nombre de fois que cet article a été vu."
    },
  },
};
