module.exports = {
  friendlyName: 'Get superadmin profile',
  description: 'Get current superadmin profile information',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Profile retrieved successfully'
    },
    unauthorized: {
      statusCode: 401,
      description: 'SuperAdmin not authenticated'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.superAdmin) {
      return exits.unauthorized({
        message: 'SuperAdmin not authenticated'
      });
    }

    const superAdmin = this.req.superAdmin;

    return exits.success({
      superAdmin: {
        id: superAdmin.id,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        username: superAdmin.username,
        email: superAdmin.email,
        role: superAdmin.role,
        permissions: superAdmin.permissions,
        emailVerified: superAdmin.emailVerified,
        isActive: superAdmin.isActive,
        lastLogin: superAdmin.lastLogin,
        createdAt: superAdmin.createdAt,
        twoFactorEnabled: superAdmin.twoFactorEnabled
      }
    });
  }
};
