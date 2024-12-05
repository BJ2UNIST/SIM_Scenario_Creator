<template>
  <div class="">
    <Menubar :model="menuItems" class="min-w-max h-12 border-b border-0 rounded-none">
      <template #start>
      </template>
      <template #end>
        <span class="px-2">{{ currentTime }}</span>
      </template>
      <template #item="{ item, props, hasSubmenu}">
        <router-link v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate"
          aria-hidden="false"
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menubar>
    <slot />
  </div>
</template>

<script setup lang="ts">

import dayjs from 'dayjs';
import { set } from 'mongoose';

const currentTime = ref("");

onNuxtReady(() => {
  setInterval(() => {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
  }, 1000);
});

const activeItem = ref('')

function isActive(item: any) {
  return activeItem.value === item.label;
}
const menuItems = ref([
  {
    label: '홈',
    class: 'menubar-root',
    route: '/',
    icon: 'pi pi-home',
  },
  {
    label: '지도',
    route: '/maps',
    command: () => {
      setActive('지도')
    }
  },
  {
    label: '프로젝트',
    route: '/projects',
    command: () => setActive('프로젝트')
  },

  {
    label: 'About',
    route: '/about',
    command: () => setActive('About')
  },
]);

function setActive(item: string) {
  activeItem.value = item;
}

onMounted(()=>{
  const v = localStorage.getItem('activeItem')
  activeItem.value = v ? v : '홈'
})

onUnmounted(() => {
  localStorage.setItem('activeItem', activeItem.value)
});

</script>
