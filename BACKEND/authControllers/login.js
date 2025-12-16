module.exports = {
  friendlyName: 'Login administrator',
  description: 'Authentifier un administrator',

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

      // Rechercher l'administrateur
      const admin = await Admin.findOne({
        email: inputs.email.toLowerCase()
      });

      if (!admin) {
        throw 'invalidCredentials';
      }

      // Vérifier si le compte est actif
      if (!admin.isActive) {
        throw 'accountInactive';
      }

      // Vérifier le mot de passe
      const isPasswordValid = await sails.helpers.security.passwordCompare(
        inputs.password,
        admin.password
      );

      if (!isPasswordValid) {
        throw 'invalidCredentials';
      }

      // Créer les tokens JWT
      const tokenPayload = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      };

      const accessToken = await sails.helpers.security.jwtGenerate(tokenPayload, '2h');
      const refreshToken = await sails.helpers.security.jwtGenerate(tokenPayload, '12h');

      // Calculer les dates d'expiration
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h
      const refreshExpiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12h

      // Créer la session
      await AdminSession.create({
        adminId: admin.id,
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
      await Admin.updateOne({ id: admin.id })
        .set({ lastLogin: new Date() });

      // Logger la connexion
      await AdminActivityLog.create({
        admin: admin.id,
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
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
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
