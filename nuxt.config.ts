// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    mistralApiKey: process.env.NOAH_MISTRAL_KEY,
    geminiApiKey: process.env.NOAH_GEMINI_KEY,

    public: {
      pgsBaseAPI: process.env.PGS_API_URL,
      pgsSharedFiles: process.env.PGS_SHARED_FILES,
      betaMode: process.env.BETA_MODE === 'true',
      siteIdentifier: process.env.SITE_IDENTIFIER,
      serviceId: process.env.SERVICE_ID,
      ssoUrl: process.env.SSO_URL,
      serviceDomain: process.env.SERVICE_DOMAIN,
    }
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Backoffice Administrateur',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
})
