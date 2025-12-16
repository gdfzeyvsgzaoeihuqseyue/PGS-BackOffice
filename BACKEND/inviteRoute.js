'POST /api/v1/admin/auth/invite': {
  policy: ['is-admin'],
    action: 'admin/auth/invite',
      swagger: {
    tags: ['ADMIN (AUTH) - ADMIN'],
      'x-groups': ['full_access']
  }
},
'POST /api/v1/admin/auth/accept-invitation': {
  action: 'admin/auth/accept-invitation',
    swagger: {
    tags: ['ADMIN (AUTH) - ADMIN'],
      'x-groups': ['public']
  }
},