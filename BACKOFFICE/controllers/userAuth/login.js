module.exports = {
  friendlyName: 'Login',
  description: 'Authenticate user and create session',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'User email address'
    },
    password: {
      type: 'string',
      required: true,
      description: 'User password'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Login successful'
    },
    invalidCredentials: {
      statusCode: 401,
      description: 'Invalid email or password'
    },
    accountInactive: {
      statusCode: 403,
      description: 'Account is inactive'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Rechercher l'utilisateur
      const user = await User.findOne({
        email: inputs.email.toLowerCase()
      }).populate('userAccess');

      if (!user) {
        throw 'invalidCredentials';
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        throw 'accountInactive';
      }

      // Vérifier le mot de passe
      const isPasswordValid = await sails.helpers.security.passwordCompare(
        inputs.password,
        user.password
      );

      if (!isPasswordValid) {
        throw 'invalidCredentials';
      }

      // Créer les tokens JWT
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        type: 'user'
      };

      const accessToken = await sails.helpers.security.jwtGenerate(tokenPayload, '1h');
      const refreshToken = await sails.helpers.security.jwtGenerate(tokenPayload, '7d');

      // Calculer les dates d'expiration
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Créer la session
      await UserSession.create({
        userId: user.id,
        token: accessToken,
        refreshToken: refreshToken,
        expiresAt: expiresAt,
        refreshExpiresAt: refreshExpiresAt,
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent'],
        deviceInfo: {
          platform: this.req.headers['sec-ch-ua-platform'] || 'unknown',
          mobile: this.req.headers['sec-ch-ua-mobile'] === '?1'
        }
      });

      // Date actuelle
      const loginTime = new Date();

      // Mettre à jour la dernière connexion
      await User.updateOne({ id: user.id })
        .set({ lastLogin: loginTime });

      // Récupérer les accès aux services
      const services = await UserAccess.find({ user: user.id })
        .populate('service');

      const validServices = services.filter(ua => ua.service);

      // Définir les cookies httpOnly
      await sails.helpers.security.authCookiesSet(
        this.res,
        accessToken,
        refreshToken
      );

      return exits.success({
        message: 'Login successful',
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: 3600,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          lastLogin: loginTime
        },
        services: validServices.map(ua => ({
          serviceId: ua.service.id,
          serviceName: ua.service.name,
          domain: ua.service.domain,
          role: ua.role,
          permissions: ua.customPermissions,
          isActive: ua.isActive
        }))
      });

    } catch (error) {
      if (error === 'invalidCredentials') {
        return exits.invalidCredentials({
          message: 'Invalid email or password'
        });
      }

      if (error === 'accountInactive') {
        return exits.accountInactive({
          message: 'Your account is inactive. Please contact support.'
        });
      }

      throw error;
    }
  }
};
