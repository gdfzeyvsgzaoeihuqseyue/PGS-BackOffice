module.exports = {
  friendlyName: 'Revoke all other admin sessions',
  description: 'Revoke all sessions except the current one for admin',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'All other sessions revoked successfully'
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

      // Récupérer le token actuel
      const currentToken = this.req.cookies.accessToken;

      // Révoquer toutes les sessions sauf la session actuelle
      const result = await AdminSession.update({
        adminId: this.req.admin.id,
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
          message: 'Admin not authenticated'
        });
      }

      sails.log.error('Error revoking all admin sessions:', error);
      throw error;
    }
  }
};
