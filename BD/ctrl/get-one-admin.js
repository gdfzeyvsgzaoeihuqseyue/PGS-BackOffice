module.exports = {
  friendlyName: 'Get admin',
  description: 'Récupérer les détails d\'un administrateur par ID',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'ID de l\'administrateur'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Administrateur récupéré avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Administrateur non trouvé'
    }
  },

  fn: async function (inputs, exits) {
    const admin = await Admin.findOne({ id: inputs.id });

    if (!admin) {
      return exits.notFound({ message: 'Administrateur non trouvé' });
    }

    return exits.success({
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.status === 'active',
        status: admin.status,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        createdBy: admin.createdBy
      }
    });
  }
};
