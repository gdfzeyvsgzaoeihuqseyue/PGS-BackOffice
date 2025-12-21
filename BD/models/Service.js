module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    domain: {
      type: 'string',
      required: true,
      unique: true,
      isURL: true
    },
    description: {
      type: 'string',
      allowNull: true
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_active'
    },
    allowedOrigins: {
      type: 'json',
      columnName: 'allowed_origins',
      defaultsTo: []
    },
    apiKey: {
      type: 'string',
      required: true,
      unique: true,
      columnName: 'api_key'
    },
    userAccess: {
      collection: 'useraccess',
      via: 'service'
    },
    learnerAccess: {
      collection: 'learneraccess',
      via: 'service'
    }
  },

  beforeCreate: async function (values, proceed) {
    if (!values.apiKey) {
      values.apiKey = await sails.helpers.security.generateApiKey();
    }
    return proceed();
  }
};
