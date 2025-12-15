module.exports = {
  attributes: {
    user: {
      model: 'user',
      required: true
    },
    service: {
      model: 'service',
      required: true
    },
    role: {
      type: 'string',
      isIn: ['user', 'admin', 'moderator'],
      defaultsTo: 'user'
    },
    customPermissions: {
      type: 'json',
      columnName: 'custom_permissions',
      defaultsTo: {}
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_active'
    },
    lastAccess: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'last_access'
    }
  }
};
