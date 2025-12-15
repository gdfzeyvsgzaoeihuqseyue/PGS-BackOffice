module.exports = {
  friendlyName: 'Revoke all other sessions',
  description: 'Revoke all sessions except the current one',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'All other sessions revoked successfully'
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

      // Récupérer le token actuel
      const currentToken = this.req.cookies.accessToken;

      // Révoquer toutes les sessions sauf la session actuelle
      const result = await UserSession.update({
        userId: this.req.user.id,
        token: { '!=': currentToken },
        isRevoked: false
      }).set({
        isRevoked: true,
        updatedAt: new Date()
      }).fetch();

      const revokedCount = result.length;

      return exits.success({
        message: `${revokedCount} session(s) revoked successfully`,
        revokedCount: revokedCount
      });

    } catch (error) {
      if (error === 'unauthorized') {
        return exits.unauthorized({
          message: 'User not authenticated'
        });
      }

      sails.log.error('Error revoking all sessions:', error);
      throw error;
    }
  }
};
