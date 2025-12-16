module.exports = {
  friendlyName: 'Get admin session',
  description: 'Get current admin session.',

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

      if (decoded.type !== 'admin') {
        throw 'noSession';
      }

      // Vérifier la session
      const session = await AdminSession.findOne({
        token: token,
        isRevoked: false
      });

      if (!session || new Date() > new Date(session.expiresAt)) {
        throw 'noSession';
      }

      // Récupérer l'admin
      const admin = await Admin.findOne({ id: decoded.adminId });

      if (!admin || !admin.isActive) {
        throw 'noSession';
      }

      return exits.success({
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          emailVerified: admin.emailVerified,
          lastLogin: admin.lastLogin
        }
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
