module.exports = {
  attributes: {
    slug: {
      type: 'string',
      required: true,
      unique: true,
      description: "Le slug unique généré pour l'auteur de blog."
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      description: "Le nom de l'auteur de blog."
    },
    avatar: {
      type: 'string',
      defaultsTo: 'https://api.dicebear.com/9.x/bottts/svg?seed=random',
      description: "URL de l'avatar de l'auteur."
    },
    role: {
      type: 'string',
      defaultsTo: 'Rédacteur',
      description: "Le rôle de l'auteur."
    },
    bio: {
      type: 'string',
      description: "La biographie de l'auteur.",
      columnType: 'text',
    },
    social: {
      type: 'json',
      defaultsTo: {},
      description: "Liens vers les profils sociaux de l'auteur (Twitter, LinkedIn, etc.)."
    },
    articles: {
      collection: 'Blog',
      via: 'author'
    }
  },
};
