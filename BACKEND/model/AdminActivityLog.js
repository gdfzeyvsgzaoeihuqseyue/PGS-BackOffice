module.exports = {
  attributes: {
    admin: {
      model: 'Admin',
      required: true
    },
    action: {
      type: 'string',
      required: true,
      description: 'Action effectuée (suspend_user, activate_learner, etc.)'
    },
    targetType: {
      type: 'string',
      isIn: ['user', 'learner', 'admin', 'service', 'system'],
      required: true,
      columnName: 'target_type'
    },
    targetId: {
      type: 'string',
      columnName: 'target_id',
      description: 'ID de l\'entité ciblée'
    },
    details: {
      type: 'json',
      defaultsTo: {},
      description: 'Détails de l\'action'
    },
    ipAddress: {
      type: 'string',
      columnName: 'ip_address'
    },
    userAgent: {
      type: 'string',
      columnName: 'user_agent'
    },
    status: {
      type: 'string',
      isIn: ['success', 'failed', 'pending'],
      defaultsTo: 'success'
    },
    errorMessage: {
      type: 'string',
      columnName: 'error_message'
    }
  }
};
