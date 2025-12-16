module.exports = {
  friendlyName: 'Verify admin token',
  description: 'Vérifier la validité d\'un token administrateur et retourner les infos',

  inputs: {
    // Les administrateurs ont généralement un accès global, 
    // donc nous n'avons pas besoin de vérifier l'accès à un service spécifique par domaine
    // comme c'est le cas pour les utilisateurs/apprenants.
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Token valide'
    },
    invalidToken: {
      statusCode: 401,
      description: 'Token invalide ou expiré'
    }
  },

  fn: async function (inputs, exits) {
    try {
      const token = this.req.cookies.accessToken;

      if (!token) {
        throw 'invalidToken';
      }

      // Vérifier le JWT
      const decoded = await sails.helpers.security.jwtVerify(token)
        .intercept('invalid', 'invalidToken');

      // Vérifier que c'est un token admin
      if (decoded.type !== 'admin') {
        throw 'invalidToken';
      }

      // Rechercher la session
      const session = await AdminSession.findOne({
        token: token,
        isRevoked: false
      });

      if (!session) {
        throw 'invalidToken';
      }

      // Vérifier l'expiration
      if (new Date() > new Date(session.expiresAt)) {
        throw 'invalidToken';
      }

      // Récupérer l'admin
      const admin = await Admin.findOne({ id: decoded.adminId });
      if (!admin || !admin.isActive) {
        throw 'invalidToken';
      }

      // Mettre à jour la dernière activité de la session
      await AdminSession.updateOne({ id: session.id })
        .set({ lastActivity: new Date() });

      return exits.success({
        valid: true,
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      });

    } catch (error) {
      if (error === 'invalidToken') {
        return exits.invalidToken({
          valid: false,
          message: 'Token invalide ou expiré'
        });
      }

      throw error;
    }
  }
};
