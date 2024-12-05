import { defineStore } from "pinia";

interface UserPayloadInterface {
  email: string;
  password: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    authenticated: false,
    loading: false,
    isAdmin: false,
    user: {},
  }),
  actions: {
    async authenticateUser({ email, password }: UserPayloadInterface) {
      try {
        const data = await $fetch("/api/user/login", {
          method: "POST",
          body: {
            email: email,
            password: password,
          },
        });
        // const token = useCookie("token"); // useCookie new hook in nuxt 3
        // token.value = data?.token;
        this.authenticated = true;
        this.user = data.user;
        this.isAdmin = data.isAdmin;

        return data.user;
      } catch (err) {
        throw err;
      }
    },
    /**
     * Check if user is logged in
     * @returns
     */
    async userLoggedIn() {
      if (!this.authenticated) {
        const data: any = await $fetch("/api/user/token", {
          headers: useRequestHeaders(["cookie"]),
        });
        if (!data.user) {
          this.authenticated = false;
        } else {
          this.authenticated = true;
        }
        return data;
      }
    },

    async logUserOut() {
      // const token = useCookie("token"); // useCookie new hook in nuxt 3
      // this.authenticated = false; // set authenticated  state value to false
      // token.value = null; // clear the token cookie

      const data = await $fetch("/api/user/logout");

      this.authenticated = false;
      // setUser(data.user);
      return data;
    },
  },
});
