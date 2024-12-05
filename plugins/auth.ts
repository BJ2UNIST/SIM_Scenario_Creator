import { useAuthStore } from "@/store/auth"; // import the auth store we just created

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  await authStore.userLoggedIn();
});
