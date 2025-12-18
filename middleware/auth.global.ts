export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.user && !authStore.initialized) {
    await authStore.fetchUser()
  }

  const isAdminRoute = to.path.startsWith('/me')
  const isLoginRoute = to.path === '/auth/login'

  // Admin Routes
  if (isAdminRoute && !authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  // Guest Redirect
  if (isLoginRoute && authStore.isAuthenticated) {
    return navigateTo('/me')
  }
})
