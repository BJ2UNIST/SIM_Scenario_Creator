<template>
  <!-- <ConfirmPopup></ConfirmPopup> -->
  <ConfirmDialog>
    <template #message="slotProps">
        <div class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700">
            <i :class="slotProps.message.icon" class="!text-6xl text-primary-500"></i>
            <p>{{ slotProps.message.message }}</p>
        </div>
    </template>
  </ConfirmDialog>
  <Toast position="bottom-left" group="bl"/>
  <Toast position="bottom-right" group="br"/>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

</script>

<style>
@import url("primeicons/primeicons.css");
@import url("~/assets/css/base.css");
@import url("node_modules/maptalks/dist/maptalks.css");
</style>
