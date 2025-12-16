module.exports = {
  friendlyName: 'Get admin sessions',
  description: 'Get all sessions for the current admin',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Sessions retrieved successfully'
    },
    unauthorized: {
      statusCode: 401,
      description: 'Admin not authenticated'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que l'admin est connecté
      if (!this.req.admin) {
        return exits.unauthorized({
          success: false,
          message: "Authentification requise."
        });
      }

      // Récupérer le token actuel depuis les cookies
      const currentToken = this.req.cookies.accessToken;

      // Récupérer toutes les sessions de l'admin
      const sessions = await AdminSession.find({
        adminId: this.req.admin.id
      }).sort('createdAt DESC');

      // Formater les sessions pour l'affichage
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        adminId: session.adminId,
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
          message: 'Admin not authenticated'
        });
      }

      sails.log.error('Error fetching admin sessions:', error);
      throw error;
    }
  }
};
