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

    // Récupérer les services associés
    const servicesAccess = await UserAccess.find({ user: inputs.id })
      .populate('service');

    const services = servicesAccess.map(access => ({
      accessId: access.id,
      serviceId: access.service.id,
      name: access.service.name,
      domain: access.service.domain,
      role: access.role,
      isActive: access.isActive,
      lastAccess: access.lastAccess,
      joinedAt: access.createdAt
    }));

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
      },
      services: services
    });
  }
};
