module.exports = {
  friendlyName: 'Login superadmin',
  description: 'Authentifier un superadmin',

  inputs: {
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Adresse email'
    },
    password: {
      type: 'string',
      required: true,
      description: 'Mot de passe'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Connexion réussie'
    },
    invalidCredentials: {
      statusCode: 401,
      description: 'Email ou mot de passe invalide'
    },
    accountInactive: {
      statusCode: 403,
      description: 'Compte inactif'
    },
    domainRestricted: {
      statusCode: 403,
      description: 'Accès restreint à panel.pgs.com'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que la requête vient de panel.pgs.com (en production)
      const origin = this.req.headers.origin || this.req.headers.referer;
      if (sails.config.environment === 'production') {
        if (!origin || !origin.includes('panel.pgs.com')) {
          throw 'domainRestricted';
        }
      }

      // Rechercher le superadmin
      const superAdmin = await SuperAdmin.findOne({
        email: inputs.email.toLowerCase()
      });

      if (!superAdmin) {
        throw 'invalidCredentials';
      }

      // Vérifier si le compte est actif
      if (!superAdmin.isActive) {
        throw 'accountInactive';
      }

      // Vérifier le mot de passe
      const isPasswordValid = await sails.helpers.security.passwordCompare(
        inputs.password,
        superAdmin.password
      );

      if (!isPasswordValid) {
        throw 'invalidCredentials';
      }

      // Créer les tokens JWT
      const tokenPayload = {
        superAdminId: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role,
        type: 'superadmin'
      };

      const accessToken = await sails.helpers.security.jwtGenerate(tokenPayload, '2h');
      const refreshToken = await sails.helpers.security.jwtGenerate(tokenPayload, '12h');

      // Calculer les dates d'expiration
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h
      const refreshExpiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12h

      // Créer la session
      await SuperAdminSession.create({
        superAdminId: superAdmin.id,
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

      // Mettre à jour la dernière connexion
      await SuperAdmin.updateOne({ id: superAdmin.id })
        .set({ lastLogin: new Date() });

      // Logger la connexion
      await SuperAdminActivityLog.create({
        superAdmin: superAdmin.id,
        action: 'login',
        targetType: 'system',
        details: {
          loginTime: new Date()
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      // Définir les cookies httpOnly
      await sails.helpers.security.authCookiesSet(
        this.res,
        accessToken,
        refreshToken
      );

      return exits.success({
        message: 'Connexion réussie',
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: 7200,
        superAdmin: {
          id: superAdmin.id,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          username: superAdmin.username,
          email: superAdmin.email,
          role: superAdmin.role,
          permissions: superAdmin.permissions
        }
      });

    } catch (error) {
      if (error === 'invalidCredentials') {
        return exits.invalidCredentials({
          message: 'Email ou mot de passe invalide'
        });
      }
      if (error === 'accountInactive') {
        return exits.accountInactive({
          message: 'Votre compte est inactif'
        });
      }
      if (error === 'domainRestricted') {
        return exits.domainRestricted({
          message: 'Accès restreint à panel.pgs.com uniquement'
        });
      }
      throw error;
    }
  }
};
