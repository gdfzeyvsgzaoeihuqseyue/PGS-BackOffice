module.exports = {
  friendlyName: 'Get user sessions',
  description: 'Get all sessions for the current user',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Sessions retrieved successfully'
    },
    unauthorized: {
      statusCode: 401,
      description: 'User not authenticated'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que l'utilisateur est connecté
      if (!this.req.user) {
        return exits.unauthorized({
          success: false,
          message: "Authentification requise."
        });
      }

      // Récupérer le token actuel depuis les cookies
      const currentToken = this.req.cookies.accessToken;

      // Récupérer toutes les sessions de l'utilisateur
      const sessions = await UserSession.find({
        userId: this.req.user.id
      }).sort('createdAt DESC');

      // Formater les sessions pour l'affichage
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        refreshExpiresAt: session.refreshExpiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        isRevoked: session.isRevoked,
        deviceInfo: session.deviceInfo || {},
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }));

      return exits.success({
        sessions: formattedSessions,
        currentToken: currentToken
      });

    } catch (error) {
      if (error === 'unauthorized') {
        return exits.unauthorized({
          message: 'User not authenticated'
        });
      }

      sails.log.error('Error fetching sessions:', error);
      throw error;
    }
  }
};
