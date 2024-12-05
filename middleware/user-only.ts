import { useAuthStore } from "@/store/auth"; // import the auth store we just created

export default defineNuxtRouteMiddleware(async () => {
  const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive

  if (!authenticated.value) {
    return navigateTo({ name: "login" });
  }
});
