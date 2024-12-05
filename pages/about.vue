<template>
  <div class="p-1">
    <div class="flex justify-center min-h-max">
      <section class="bg-slate-50 p-10 rounded-xl flex flex-col gap-8 max-w-2xl min-w-full">
        <h1 class="text-4xl text-black dark:text-white font-bold text-center">
          합성데이터 생성 도구
        </h1>
      </section>
    </div>
  </div>
</template>

<script setup>

definePageMeta({
  middleware: null // this should match the name of the file inside the middleware directory
})


import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const { $log } = useNuxtApp();
$log.info('This is a log message')
</script>
