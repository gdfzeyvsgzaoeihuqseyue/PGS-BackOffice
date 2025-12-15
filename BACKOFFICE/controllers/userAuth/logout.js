module.exports = {
  friendlyName: 'Logout',
  description: 'Logout user and revoke session',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Logout successful'
    }
  },

  fn: async function (inputs, exits) {
    try {
      const token = this.req.cookies.accessToken;

      if (token) {
        // Révoquer la session
        await UserSession.update({ token: token })
          .set({ isRevoked: true });
      }

      // Supprimer les cookies
      await sails.helpers.security.authCookiesClear(this.res);

      return exits.success({
        message: 'Logout successful'
      });
    } catch (err) {
      throw err;
    }
  }
};
