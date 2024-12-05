<template>
  <div class="min-h-[20rem] flex flex-col items-center justify-center gap-2 p-5">
    <Panel header="Logout" class="w-96 animate__animated " :class="animation">
      <div class="font-bold">
        시스템에서 로그아웃 합니다.
      </div>
      <div class="p-5 flex justify-center space-x-1">
        <Button @click="logout($event)" text raised>네</Button>
        <Button @click="cancel()" text raised>아니오</Button>
      </div>
    </Panel>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  layout: false,
})

import { useAuthStore } from "~/store/auth";

const router = useRouter();

const { logUserOut } = useAuthStore();

const animation = ref("animate__bounceInLeft");

const logout = async (event: any) => {
  animation.value = "animate__bounceOutRight";
  await logUserOut();

  setTimeout(() => {
    router.push("/login");
  }, 1000);
};

const cancel = () => {
  animation.value = "animate__bounceOutLeft";
  setTimeout(() => {
    router.back();
  }, 1000);
};
</script>
