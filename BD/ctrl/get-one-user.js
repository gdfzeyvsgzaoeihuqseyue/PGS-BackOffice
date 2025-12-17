module.exports = {
  friendlyName: 'Get user',
  description: 'Récupérer les détails d\'un utilisateur par ID',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'ID de l\'utilisateur'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Utilisateur récupéré avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Utilisateur non trouvé'
    }
  },

  fn: async function (inputs, exits) {
    const user = await User.findOne({ id: inputs.id });

    if (!user) {
      return exits.notFound({ message: 'Utilisateur non trouvé' });
    }

    return exits.success({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  }
};
