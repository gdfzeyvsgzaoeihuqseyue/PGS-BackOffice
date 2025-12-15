module.exports = {
  friendlyName: 'Get user profile',
  description: 'Get current user profile information',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Profile retrieved successfully'
    },
    unauthorized: {
      statusCode: 401,
      description: 'User not authenticated'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.user) {
      return exits.unauthorized({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findOne({ id: this.req.user.id })
      .populate('userAccess');

    const services = await UserAccess.find({
      user: user.id,
      isActive: true
    }).populate('service');

    const validServices = services.filter(ua => ua.service);

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
      services: validServices.map(ua => ({
        serviceId: ua.service.id,
        serviceName: ua.service.name,
        domain: ua.service.domain,
        role: ua.role,
        permissions: ua.customPermissions,
        lastAccess: ua.lastAccess,
        isActive: ua.isActive
      }))
    });
  }
};
