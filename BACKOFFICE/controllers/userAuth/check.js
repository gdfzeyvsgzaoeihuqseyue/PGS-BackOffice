module.exports = {
  friendlyName: 'SSO Auth Check',
  description: 'Vérifier l\'authentification utilisateur et rediriger vers le service (sans validation de service)',

  inputs: {
    returnUrl: {
      type: 'string',
      required: true,
      description: 'URL de retour vers le service'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Informations d\'authentification récupérées'
    },
    unauthorized: {
      statusCode: 401,
      description: 'Utilisateur non authentifié'
    },
    invalidReturnUrl: {
      statusCode: 400,
      description: 'URL de retour invalide'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Valider que l'URL de retour est fournie
      if (!inputs.returnUrl) {
        return exits.invalidReturnUrl({
          authenticated: false,
          message: 'URL de retour manquante'
        });
      }

      // Récupérer le token depuis les cookies
      const token = this.req.cookies.accessToken;

      // Si pas de token
      if (!token) {
        return exits.success({
          authenticated: false,
          redirectUrl: '/auth/login',
          returnUrl: inputs.returnUrl
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

      // Générer un token SSO temporaire pour la redirection
      const ssoToken = await sails.helpers.security.jwtGenerate({
        userId: user.id,
        email: user.email,
        type: 'user-sso-check'
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
        redirectUrl: inputs.returnUrl
      });

    } catch (error) {
      if (error === 'unauthorized') {
        return exits.unauthorized({
          authenticated: false,
          message: 'Non authentifié',
          redirectUrl: '/auth/login',
          returnUrl: inputs.returnUrl
        });
      }

      throw error;
    }
  }
};
