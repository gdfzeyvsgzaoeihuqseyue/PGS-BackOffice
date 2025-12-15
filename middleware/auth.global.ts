export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Ensure user state is initialized
  // This will run on server for initial load, and client for navigation
  if (!authStore.user && authStore.loading) {
    await authStore.fetchUser()
  }

  const isAdminRoute = to.path.startsWith('/admin')
  const isLoginRoute = to.path === '/login'

  // Protect Admin Routes
  if (isAdminRoute && !authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Guest Redirect
  if (isLoginRoute && authStore.isAuthenticated) {
    return navigateTo('/admin/users') // Default landing
  }
})
