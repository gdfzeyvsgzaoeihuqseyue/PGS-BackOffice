module.exports = {
  friendlyName: 'Revoke session',
  description: 'Revoke a specific session',

  inputs: {
    sessionId: {
      type: 'string',
      required: true,
      description: 'ID of the session to revoke'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Session revoked successfully'
    },
    unauthorized: {
      statusCode: 401,
      description: 'User not authenticated'
    },
    notFound: {
      statusCode: 404,
      description: 'Session not found'
    },
    forbidden: {
      statusCode: 403,
      description: 'Cannot revoke current session or session belongs to another user'
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

      // Récupérer le token actuel
      const currentToken = this.req.cookies.accessToken;

      // Trouver la session à révoquer
      const session = await UserSession.findOne({
        id: inputs.sessionId
      });

      // Vérifier que la session existe
      if (!session) {
        throw 'notFound';
      }

      // Vérifier que la session appartient bien à l'utilisateur
      if (session.userId !== this.req.user.id) {
        throw 'forbidden';
      }

      // Empêcher la révocation de la session actuelle
      if (session.token === currentToken) {
        throw 'forbidden';
      }

      // Révoquer la session
      await UserSession.updateOne({
        id: inputs.sessionId
      }).set({
        isRevoked: true,
        updatedAt: new Date()
      });

      return exits.success({
        message: 'Session revoked successfully',
        sessionId: inputs.sessionId
      });

    } catch (error) {
      if (error === 'unauthorized') {
        return exits.unauthorized({
          message: 'User not authenticated'
        });
      }

      if (error === 'notFound') {
        return exits.notFound({
          message: 'Session not found'
        });
      }

      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Cannot revoke this session'
        });
      }

      sails.log.error('Error revoking session:', error);
      throw error;
    }
  }
};
