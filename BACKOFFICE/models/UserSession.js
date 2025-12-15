module.exports = {
  attributes: {
    userId: {
      type: 'string',
      required: true,
      columnName: 'user_id'
    },
    token: {
      type: 'string',
      required: true,
      unique: true
    },
    refreshToken: {
      type: 'string',
      required: true,
      unique: true,
      columnName: 'refresh_token'
    },
    expiresAt: {
      type: 'ref',
      columnType: 'datetime',
      required: true,
      columnName: 'expires_at'
    },
    refreshExpiresAt: {
      type: 'ref',
      columnType: 'datetime',
      required: true,
      columnName: 'refresh_expires_at'
    },
    ipAddress: {
      type: 'string',
      columnName: 'ip_address'
    },
    userAgent: {
      type: 'string',
      columnName: 'user_agent'
    },
    isRevoked: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_revoked'
    },
    deviceInfo: {
      type: 'json',
      columnName: 'device_info',
      defaultsTo: {}
    }
  }
};
