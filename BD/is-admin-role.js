module.exports = async function (req, res, proceed) {

  // Vérifiez si l'administrateur est authentifié
  if (!req.admin) {
    return res.status(401).json({
      message: 'Admin not authenticated'
    });
  }

  // Récupérer les rôles autorisés de la route
  const allowedRoles = req.options.allowedRoles;
  const actionRoles = req.options.actionRoles;

  // Vérification par action spécifique
  if (actionRoles && typeof actionRoles === 'object') {
    const requestedAction = req.param('action');
    if (requestedAction && actionRoles[requestedAction]) {
      const requiredRolesForAction = actionRoles[requestedAction];

      if (!requiredRolesForAction.includes(req.admin.role)) {
        return res.status(403).json({
          message: 'Insuffisent role access for this action',
          required: requiredRolesForAction,
          current: req.admin.role,
          action: requestedAction
        });
      }
    }
  }

  // Vérification globale
  if (!allowedRoles || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return proceed();
  }

  // Vérifier si le rôle de l'administrateur est autorisé
  if (allowedRoles.includes(req.admin.role)) {
    return proceed();
  }

  // Si le rôle n'est pas autorisé
  return res.status(403).json({
    message: 'Insuffisent role access',
    required: allowedRoles,
    current: req.admin.role
  });

};
