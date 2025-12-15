module.exports = {
  friendlyName: 'Verify token',
  description: 'Verify if a token is valid and return user info',

  inputs: {
    serviceDomain: {
      type: 'string',
      description: 'The domain of the service requesting verification'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Token is valid'
    },
    invalidToken: {
      statusCode: 401,
      description: 'Invalid or expired token'
    },
    serviceInactive: {
      statusCode: 403,
      description: 'Service access is inactive'
    }
  },

  fn: async function (inputs, exits) {
    try {
      const token = this.req.cookies.accessToken;

      if (!token) {
        throw 'invalidToken';
      }

      // Vérifier le JWT
      const decoded = await sails.helpers.security.jwtVerify(token)
        .intercept('invalid', 'invalidToken');

      // Vérifier que c'est un token utilisateur
      if (decoded.type !== 'user') {
        throw 'invalidToken';
      }

      // Rechercher la session
      const session = await UserSession.findOne({
        token: token,
        isRevoked: false
      });

      if (!session) {
        throw 'invalidToken';
      }

      // Vérifier l'expiration
      if (new Date() > new Date(session.expiresAt)) {
        throw 'invalidToken';
      }

      // Récupérer l'utilisateur
      const user = await User.findOne({ id: decoded.userId });
      if (!user || !user.isActive) {
        throw 'invalidToken';
      }

      // Si un domaine de service est fourni, vérifier l'accès
      let userAccess = null;
      if (inputs.serviceDomain) {
        const service = await Service.findOne({
          domain: inputs.serviceDomain,
          isActive: true
        });

        if (service) {
          userAccess = await UserAccess.findOne({
            user: user.id,
            service: service.id,
            isActive: true
          });

          // Si l'accès n'existe pas ou est inactif
          if (!userAccess) {
            throw 'serviceInactive';
          }

          // Mettre à jour le lastAccess
          await UserAccess.updateOne({ id: userAccess.id })
            .set({ lastAccess: new Date() });
        } else {
          throw 'serviceInactive';
        }
      }

      return exits.success({
        valid: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified
        },
        userAccess: userAccess ? {
          role: userAccess.role,
          permissions: userAccess.customPermissions,
          lastAccess: new Date()
        } : null
      });

    } catch (error) {
      if (error === 'invalidToken') {
        return exits.invalidToken({
          valid: false,
          message: 'Invalid or expired token'
        });
      }

      if (error === 'serviceInactive') {
        return exits.serviceInactive({
          valid: false,
          message: 'Service access is inactive or does not exist'
        });
      }

      throw error;
    }
  }
};
