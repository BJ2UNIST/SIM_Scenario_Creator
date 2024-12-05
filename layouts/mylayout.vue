<template>
  <div class="min-h-screen">
    <div class="p-2 bg-slate-700 flex justify-between text-white">
      <div>
        프로젝트 {{ projectId }}
      </div>
      <div>
        <button @click="confirmExit">닫기</button>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup>
const router = useRouter();
const route = useRoute();
const projectId = computed(() => route.params.projectId)
const confirm = useConfirm();
const confirmExit = () => {
  router.back(-1)
  // confirm.require({
  //   message: 'Are you sure you want to exit?',
  //   header: 'Confirmation',
  //   icon: 'pi pi-exclamation-triangle',
  //   rejectProps: {
  //     label: 'Cancel',
  //     severity: 'secondary',
  //     icon: 'pi pi-times',
  //     outlined: true,
  //     size: 'small'
  //   },
  //   acceptProps: {
  //     label: 'Yes',
  //     icon: 'pi pi-check',
  //     severity: 'contrast',
  //     size: 'small'
  //   },
  //   accept: () => {
  //     router.back(-1)
  //   },
  //   reject: () => {
  //   }
  // });
};

</script>
