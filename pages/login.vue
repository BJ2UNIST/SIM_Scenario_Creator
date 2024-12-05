<template>
  <div class="min-h-screen flex flex-col items-center gap-2 p-5">
    <div class="text-2xl font-bold text-pretty">Login</div>
    <div class="flex flex-col w-96">
      <SelectButton
        v-model="loginOption"
        :options="loginOptions"
        aria-labelledby="basic"
      />
    </div>
    <Panel
      header="PIN Login"
      class="w-96 bg-slate-100 animate__animated animate__flipInX"
      v-if="loginOption === 'PIN'"
    >
      <div class="p-5 flex justify-center">
        <InputOtp v-model="pinNumber" />
      </div>
    </Panel>
    <Panel
      header="ID / Password Login"
      class="w-96 bg-slate-50 animate__animated animate__flipInX"
      v-else
    >
      <div class="p-5 text-center flex flex-col gap-2">
        <InputText v-model="user.email" placeholder="Email" />
        <InputText v-model="user.password" placeholder="Password" />
        <Button label="Login" @click="login" />
      </div>
    </Panel>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: false,
});

import { storeToRefs } from "pinia"; // import storeToRefs helper hook from pinia
import { useAuthStore } from "@/store/auth"; // import the auth store we just created

const { authenticateUser } = useAuthStore(); // use authenticateUser action from  auth store

const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs
const toast = useToast();
const router = useRouter();

const user = ref({
  email: "user@gmail.com",
  password: "password",
});

const loginOption = ref("Password");
const loginOptions = ref(["PIN", "Password"]);
const pinNumber = ref("");

const login = async () => {
  try {
    await authenticateUser(user.value);
    if (authenticated) {
      router.push("/");
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Login Failed",
      detail: "ID or Password is incorrect",
      life: 3000,
    });
  }
};

watchEffect(() => {
  if (pinNumber.value.length === 4) {
    login();
  }
});

</script>
