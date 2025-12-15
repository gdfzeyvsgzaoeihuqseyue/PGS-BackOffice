module.exports = async function (req, res, proceed) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: 'No authorization token provided'
    });
  }

  try {
    const decoded = await sails.helpers.security.jwtVerify(token);

    // Vérifier que c'est un token superadmin
    if (decoded.type !== 'superadmin') {
      return res.status(401).json({
        message: 'Type de token invalide'
      });
    }

    const session = await SuperAdminSession.findOne({
      token: token,
      isRevoked: false
    });

    if (!session) {
      return res.status(401).json({
        message: 'Invalid or revoked token'
      });
    }

    if (new Date() > new Date(session.expiresAt)) {
      return res.status(401).json({
        message: 'Token has expired'
      });
    }

    // Mettre à jour lastActivity
    await SuperAdminSession.updateOne({ id: session.id })
      .set({ lastActivity: new Date() });

    const superAdmin = await SuperAdmin.findOne({ id: decoded.superAdminId });

    if (!superAdmin || !superAdmin.isActive) {
      return res.status(401).json({
        message: 'SuperAdmin not found or inactive'
      });
    }

    // Ajouter le superadmin à la requête
    req.superAdmin = superAdmin;

    return proceed();

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
};
