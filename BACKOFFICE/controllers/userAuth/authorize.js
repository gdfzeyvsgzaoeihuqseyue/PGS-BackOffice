module.exports = {
  friendlyName: 'SSO Callback',
  description: 'Gérer la connexion SSO et rediriger vers le service',

  inputs: {
    serviceId: {
      type: 'string',
      required: true,
      description: 'ID du service demandeur'
    },
    action: {
      type: 'string',
      isIn: ['login', 'register'],
      defaultsTo: 'login',
      description: 'Action demandée (login ou register)'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Informations SSO récupérées'
    },
    serviceNotFound: {
      statusCode: 404,
      description: 'Service non trouvé'
    },
    serviceInactive: {
      statusCode: 403,
      description: 'Service inactif'
    },
    unauthorized: {
      statusCode: 401,
      description: 'Utilisateur non authentifié'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que le service existe et est actif
      const service = await Service.findOne({ id: inputs.serviceId });

      if (!service) {
        throw 'serviceNotFound';
      }

      if (!service.isActive) {
        throw 'serviceInactive';
      }

      // Récupérer le token depuis les cookies
      const token = this.req.cookies.accessToken;

      if (!token) {
        return exits.success({
          authenticated: false,
          action: inputs.action,
          service: {
            id: service.id,
            name: service.name,
            domain: service.domain
          },
          redirectUrl: inputs.action === 'login'
            ? '/auth/login'
            : '/auth/register'
        });
      }

      // Vérifier le token
      const decoded = await sails.helpers.security.jwtVerify(token)
        .intercept('invalid', 'unauthorized');

      if (decoded.type !== 'user') {
        throw 'unauthorized';
      }

      // Vérifier la session
      const session = await UserSession.findOne({
        token: token,
        isRevoked: false
      });

      if (!session || new Date() > new Date(session.expiresAt)) {
        throw 'unauthorized';
      }

      // Récupérer l'utilisateur
      const user = await User.findOne({ id: decoded.userId });

      if (!user || !user.isActive) {
        throw 'unauthorized';
      }

      // Vérifier si l'utilisateur a déjà accès au service
      let userAccess = await UserAccess.findOne({
        user: user.id,
        service: service.id
      });

      // Si pas d'accès, le créer automatiquement
      if (!userAccess) {
        userAccess = await UserAccess.create({
          user: user.id,
          service: service.id,
          role: 'user',
          customPermissions: {},
          isActive: true,
          lastAccess: new Date()
        }).fetch();

        sails.log.info(`Accès automatique créé pour l'utilisateur ${user.email} au service ${service.name}`);
      } else {
        // Réactiver l'accès s'il était inactif
        if (!userAccess.isActive) {
          await UserAccess.updateOne({ id: userAccess.id })
            .set({
              isActive: true,
              lastAccess: new Date()
            });
        } else {
          // Mettre à jour le lastAccess
          await UserAccess.updateOne({ id: userAccess.id })
            .set({ lastAccess: new Date() });
        }
      }

      // Générer un token SSO temporaire pour la redirection
      const ssoToken = await sails.helpers.security.jwtGenerate({
        userId: user.id,
        email: user.email,
        serviceId: service.id,
        type: 'user-sso-authorize'
      }, '5m');

      return exits.success({
        authenticated: true,
        ssoToken: ssoToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          emailVerified: user.emailVerified
        },
        service: {
          id: service.id,
          name: service.name,
          domain: service.domain
        },
        access: {
          role: userAccess.role,
          permissions: userAccess.customPermissions,
          isActive: userAccess.isActive
        },
        redirectUrl: service.domain
      });

    } catch (error) {
      if (error === 'serviceNotFound') {
        return exits.serviceNotFound({
          message: 'Service non trouvé'
        });
      }

      if (error === 'serviceInactive') {
        return exits.serviceInactive({
          message: 'Ce service est actuellement inactif'
        });
      }

      if (error === 'unauthorized') {
        return exits.unauthorized({
          authenticated: false,
          message: 'Non authentifié',
          service: {
            id: inputs.serviceId
          },
          redirectUrl: inputs.action === 'login'
            ? '/auth/login'
            : '/auth/register'
        });
      }

      throw error;
    }
  }
};
