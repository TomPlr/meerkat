// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-07-11',

  runtimeConfig: {
    public: {
      reownProjectId: process.env.NUXT_PUBLIC_REOWN_PROJECT_ID,
    },
  },
})
