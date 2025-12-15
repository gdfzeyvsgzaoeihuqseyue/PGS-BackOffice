module.exports = {
  friendlyName: 'Get session',
  description: 'Get current user session.',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Session retrieved successfully'
    },
    noSession: {
      statusCode: 401,
      description: 'No active session'
    }
  },

  fn: async function (inputs, exits) {
    try {
      const token = this.req.cookies.accessToken;

      if (!token) {
        throw 'noSession';
      }

      // Vérifier le token
      const decoded = await sails.helpers.security.jwtVerify(token)
        .intercept('invalid', 'noSession');

      if (decoded.type !== 'user') {
        throw 'noSession';
      }

      // Vérifier la session
      const session = await UserSession.findOne({
        token: token,
        isRevoked: false
      });

      if (!session || new Date() > new Date(session.expiresAt)) {
        throw 'noSession';
      }

      // Récupérer l'utilisateur
      const user = await User.findOne({ id: decoded.userId });

      if (!user || !user.isActive) {
        throw 'noSession';
      }

      // Récupérer les services
      const services = await UserAccess.find({
        user: user.id,
        isActive: true
      }).populate('service');

      const validServices = services.filter(sa => sa.service);

      return exits.success({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          lastLogin: user.last_login || user.lastLogin
        },
        services: validServices.map(sa => ({
          serviceId: sa.service.id,
          serviceName: sa.service.name,
          domain: sa.service.domain,
          role: sa.role,
          permissions: sa.customPermissions,
          isActive: sa.isActive,
          lastAccess: sa.lastAccess
        }))
      });

    } catch (error) {
      if (error === 'noSession') {
        return exits.noSession({
          message: 'No active session'
        });
      }

      throw error;
    }
  }
};
