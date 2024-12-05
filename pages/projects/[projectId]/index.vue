<template>

  <div class="max-w-screen-lg m-auto p-5">
    <div class="grid grid-cols-3 gap-2">
      <div class="p-2 bg-slate-200 text-center h-40 flex items-center text-2xl justify-center rounded-lg">
        <nuxt-link :to="envPath">
          환경
        </nuxt-link>
      </div>
      <div class="p-2 bg-blue-200 text-center h-40 flex items-center text-2xl justify-center rounded-lg">
        <nuxt-link :to="eventPath">
          이벤트
        </nuxt-link>
      </div>
      <div class="p-2 bg-yellow-200 text-center h-40 flex items-center text-2xl justify-center rounded-lg">
        <nuxt-link :to="agentPath">
          에이전트
        </nuxt-link>
      </div>

    </div>
  </div>
</template>

<script setup>

definePageMeta({
  layout: 'mylayout',
  // colorMode: 'dark'
})


const route = useRoute();

const projectId = ref(route.params.projectId);

const envPath = computed(() => `/projects/${projectId.value}/env`);
const eventPath = computed(() => `/projects/${projectId.value}/event`);
const agentPath = computed(() => `/projects/${projectId.value}/agent`);

</script>
