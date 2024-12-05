import { useAuthStore } from "@/store/auth"; // import the auth store we just created

export default defineNuxtRouteMiddleware(async (_to, from) => {
  const { authenticated, isAdmin } = storeToRefs(useAuthStore()); // make authenticated state reactive

  if (!isAdmin.value) {
    return navigateTo({ name: "login" });
  }
});
