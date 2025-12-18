import { defu } from 'defu'
import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(url: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()

  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.pgsBaseAPI || '/api/v1',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...useRequestHeaders(['cookie'])
    },
    async onResponseError({ response, request }) {
      if (response.status === 401) {
        const authStore = useAuthStore()
        const sessionStore = useSessionStore()
        const router = useRouter()

        // Avoid infinite loop if the error comes from the refresh endpoint itself
        if (request.toString().includes('/admin/auth/refresh-token')) {
          authStore.user = null
          if (router.currentRoute.value.path !== '/auth/login') {
            await navigateTo('/auth/login')
          }
          return
        }

        // Try to refresh the token
        try {
          await sessionStore.refreshToken()
        } catch (e) {
          // If refresh fails, then we are truly unauthorized
          authStore.user = null
          if (router.currentRoute.value.path !== '/auth/login') {
            await navigateTo('/auth/login')
          }
        }
      }
    }
  }

  const params = defu(options, defaults)

  return useFetch(url, params)
}
