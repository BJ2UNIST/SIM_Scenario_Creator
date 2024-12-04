import * as path from "path";

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@primevue/nuxt-module",
    "@pinia/nuxt",
    "nuxt-file-storage",
    // "nuxt-server-utils",
  ],

  primevue: {
    options: {
      unstyled: true,
    },
    importPT: { as: "Aura", from: path.resolve(__dirname, "./presets/aura/") },
  },

  tailwindcss: {
    config: {
      plugins: [require("tailwindcss-primeui")],
      content: ["./presets/**/*.{js,vue,ts}"],
      darkMode: "class",
    },
  },

  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          // href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.min.css",
        },
      ],
    },
  },

  runtimeConfig: {
    tokenSecret: process.env.NUXT_TOKEN_SECRET,
    tokenExpiration: process.env.NUXT_TOKEN_EXPIRES,
    tokenName: process.env.NUXT_TOKEN_NAME,
    mongodbUri: process.env.MONGODB_URI,
    fileStorageMount: process.env.mount,
  },

  // app.vue 에 넣어도 되고 여기에 넣어도 됨
  css: [
    "@fortawesome/fontawesome-svg-core/styles.css",
    "animate.css",
    "primeicons/primeicons.css",
    "~/assets/css/font-awesome.min.css",
  ],
  build: {
    transpile: ["@fortawesome/vue-fontawesome"],
  },

  fileStorage: {
    // {OR} use environment variables (recommended)
    mount: process.env.mount,
    // you need to set the mount in your .env file at the root of your project
  },
  nitro: {
    // plugins: ["~/server/plugins/mongodb.ts"],
  },
  compatibilityDate: "2024-08-13",
});
