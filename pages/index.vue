<template>
  <div
    class="bg-slate-500 min-h-screen p-2 flex flex-col bg-gradient-to-tr from-slate-900 from-10% via-slate-700 via-30% to-slate-900 to-90% w-full">
    <section class="p-10 rounded-xl flex flex-col gap-2 flex-1">
      <div class="text-slate-100 flex flex-col gap-5 flex-1">
        <div class="flex space-x-1 justify-end items-center">
          <!-- <nuxt-link to="/logout" v-if="authenticated">
            <font-awesome-icon icon="fa fa-arrow-right-from-bracket"></font-awesome-icon>
          </nuxt-link>
          <nuxt-link to="/login" v-else>
            <font-awesome-icon icon="fa fa-sign-in" />
          </nuxt-link> -->
        </div>
        <div class="flex flex-col justify-center items-center p-5 min-h-96">
          <h1 class="text-6xl font-extrabold animate__animated animate__tada">
            The Easy
          </h1>
          <h1
            class="text-6xl text-slate-100 font-bold py-5 italic bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
            {{ title }}
          </h1>
        </div>
        <div class="flex justify-center">
          <nuxt-link to="/projects" class="hover:text-blue-300">
            시작하기
            <font-awesome-icon icon="fa fa-arrow-right"></font-awesome-icon>
          </nuxt-link>
        </div>
      </div>
    </section>
    <div class="text-center text-slate-400">
      <span class="italic">Sythentic Data Modeler</span> 2024 © ETRI
    </div>
  </div>

  <div class="flex lg:flex-row flex-col gap-4 bg-surface-300 min-h-screen" v-if="false">
    <div class="flex-1 flex items-center justify-center">
      <div class="p-6 pt-6 lg:p-12">
        <h1
          class="text-3xl lg:text-5xl font-bold text-surface-900 dark:text-surface-0 mb-4 lg:leading-normal text-center lg:text-left">
          Create the data using <br /><span class="text-blue-500 dark:text-blue-400">{{ title }}</span>
        </h1>
        <p class="text-surface-900 leading-normal mb-8 text-center lg:text-left">
          합성 데이터는 컴퓨터 시뮬레이션이나 알고리즘이 실제 데이터의 대안으로 생성하는 주석이 달린 정보입니다.
          다시 말해, 합성 데이터는 현실 세계에서 수집하거나 측정한 것이 아니라 디지털 세계에서 생성된 것입니다.
          인위적일 수 있지만 합성 데이터는 수학적으로나 통계적으로 실제 데이터를 반영합니다. 연구에 따르면 합성 데이터는 실제 사물, 사건 또는 사람을 기반으로 한 데이터보다 AI 모델을 학습시키는 데 더
          효과적이거나 더 우수할 수 있습니다.
        </p>
        <div class="flex items-center justify-center lg:justify-start gap-6">
          <Button label="시작하기" type="button" to="/projects" as="router-link" />
          <Button label="About" type="button" outlined />
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-hidden">
      <img src="https://cdn.digitaltoday.co.kr/news/photo/202307/482514_450309_5920.jpg" alt="hero-1"
        class="h-full w-full object-cover lg:[clip-path:polygon(12%_0,100%_0%,100%_100%,0_100%)]" />
    </div>
  </div>
</template>


<script setup lang="ts">
definePageMeta({
  layout: false,
  colorMode: 'dark'
})

import { storeToRefs } from "pinia";

import { useAuthStore } from "~/store/auth";

const title = "Synthetic Data Modeler";

const { authenticated } = storeToRefs(useAuthStore());

const stateMsg = computed(() => authenticated.value ? "Authenticated" : "Not Authenticated");

</script>
