module.exports = {
  friendlyName: 'Refresh token',
  description: 'Refresh access token using refresh token',

  inputs: {},

  exits: {
    success: {
      statusCode: 200,
      description: 'Token refreshed successfully'
    },
    invalidToken: {
      statusCode: 401,
      description: 'Invalid or expired refresh token'
    }
  },

  fn: async function (inputs, exits) {
    try {
      const refreshToken = this.req.cookies.refreshToken;

      if (!refreshToken) {
        throw 'invalidToken';
      }

      // Vérifier le refresh token
      const decoded = await sails.helpers.security.jwtVerify(refreshToken)
        .intercept('invalid', 'invalidToken');

      // Vérifier que c'est bien un token utilisateur
      if (decoded.type !== 'user') {
        throw 'invalidToken';
      }

      // Rechercher la session
      const session = await UserSession.findOne({
        refreshToken: refreshToken,
        isRevoked: false
      });

      if (!session) {
        throw 'invalidToken';
      }

      // Vérifier l'expiration du refresh token
      if (new Date() > new Date(session.refreshExpiresAt)) {
        await UserSession.updateOne({ id: session.id })
          .set({ isRevoked: true });

        // Supprimer les cookies
        await sails.helpers.security.authCookiesClear(this.res);

        throw 'invalidToken';
      }

      // Vérifier que l'utilisateur existe et est actif
      const user = await User.findOne({ id: decoded.userId });
      if (!user || !user.isActive) {
        // Supprimer les cookies
        await sails.helpers.security.authCookiesClear(this.res);
        throw 'invalidToken';
      }

      // Générer un nouveau token d'accès
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        type: 'user'
      };

      const newAccessToken = await sails.helpers.security.jwtGenerate(tokenPayload, '1h');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

      // Mettre à jour la session
      await UserSession.updateOne({ id: session.id })
        .set({
          token: newAccessToken,
          expiresAt: expiresAt
        });

      // Mettre à jour le cookie d'access token
      await sails.helpers.security.authCookiesSet(
        this.res,
        newAccessToken,
        refreshToken
      );

      return exits.success({
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        expiresIn: 3600
      });

    } catch (error) {
      if (error === 'invalidToken') {
        return exits.invalidToken({
          message: 'Invalid or expired refresh token'
        });
      }

      throw error;
    }
  }
};
