// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
  ],
  css: ['~/assets/css/main.css'],

  googleFonts: {
    display: 'swap',
    families: {
      'Kedebideri': [400, 500, 600, 700, 800, 900],
      'Science+Gothic': [100, 200, 300, 400, 500, 600, 700, 800, 900],
      'Stack+Sans+Notch': [100, 200, 300, 400, 500, 600, 700, 800, 900],
    }
  },

  runtimeConfig: {
    mistralApiKey: process.env.NOAH_MISTRAL_KEY,
    geminiApiKey: process.env.NOAH_GEMINI_KEY,

    public: {
      pgsBaseAPI: process.env.PGS_API_URL,
      pgsSharedFiles: process.env.PGS_SHARED_FILES,
      betaMode: process.env.BETA_MODE === 'true',
      siteIdentifier: process.env.SITE_IDENTIFIER,
    }
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Backoffice PRO GESTION SOFT',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'Pro Gestion Soft' },
        { name: 'keywords', content: 'Pro Gestion Soft, numérique, PME, Afrique, Bénin, SaaS, digitalisation, technologie, PGS, SuitOps' },
        { name: 'google-site-verification', content: 'OdKxHpVkBSxk0mj4vD4OTmZPdVi5pWzyCu4QPIMHy9A' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://progestionsoft.netlify.app' }
      ]
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
})
