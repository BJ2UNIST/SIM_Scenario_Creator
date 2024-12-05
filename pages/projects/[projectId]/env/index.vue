<template>
  <div class="p-2 bg-red-200">
      시뮬레이션 환경 관리
    </div>

  <div class="flex flex-col gap-2 max-w-screen-lg m-auto">
    <div class="bg-white p-2 rounded flex flex-col gap-2">
      <div class="flex space-x-2">
        <Button @click.prevent="visibleProjectCreationDialog = true" class="hover:text-blue-500">
          환경 등록
        </Button>
        <Button :to="`/projects/project1/env/testEnv`" as="router-link" size="small">
          새로운 환경 만들기
        </Button>
      </div>
      <DataTable :value="envs" stripedRows showGridlines tableStyle="min-width: 50rem;" :pt="tablePt"
        :ptOptions="{ mergeProps: true }">
        <Column field="envId" header="환경 아이디"></Column>
        <Column field="envName" header="설명"></Column>
        <Column field="envOwner" header="사용자"></Column>
        <Column field="mapId" header="지역"></Column>
        <Column field="createdAt" header="등록일">
          <template #body="{ data }">
            {{ toKST(data.createdAt) }}
          </template>
        </Column>
        <Column field="quantity" header="기능">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button :to="`/projects/project1/env/${data.envId}?mapId=${data.mapId}`" as="router-link" size="small">
                편집
              </Button>

              <Button label="삭제" @click="confirmDeleteProject($event, data.envId)" size="small">
                삭제
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="visibleProjectCreationDialog" modal header="새로운 환경 등록" class="min-w-96">
    <div class="flex flex-col gap-2">

      <div>
        프로젝트: <InputText v-model="projectId" class="flex-auto w-full" autocomplete="off" placeholder="" disabled/>
      </div>

      <div class="">
        환경 ID:
        <InputText v-model="envId" class="flex-auto w-full" autocomplete="off" placeholder="고유 아이디를 입력하세요." autofocus/>
      </div>
      <div class="">
        <InputText v-model="envName" class="w-full" autocomplete="off" placeholder="설명을 입력하세요." />
      </div>
      <div>
        기본환경:
        <Select v-model="selectedMapId" class="w-full" :options="maps" placeholder="사용할 베이스 환경을 선택하세요" optionLabel="name" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="취소" severity="secondary" size="small" @click="visibleProjectCreationDialog = false"/>
        <Button type="button" label="저장" size="small" severity="contrast" @click="createProject"/>
      </div>
    </div>
  </Dialog>
</template>

<style>
.btn {
  @apply w-8 h-8 flex justify-center items-center;
}
</style>

<script setup>

definePageMeta({
  layout: 'mylayout',
  // colorMode: 'dark'
})

import dayjs from 'dayjs';

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const toKST = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');

const route = useRoute();

const visibleProjectCreationDialog = ref(false);
const confirm = useConfirm();
const toast = useToast();

const envId = ref('');
const envName = ref('');

const projectId = computed(() => route.params.projectId)

const { data: envs, refresh } = await useFetch(`/api/envs?projectId=${projectId.value}`, {})

const { data: dataMaps, refresh: refreshProject } = await useFetch("/api/maps", {})



const tablePt = {
  column: {
    headerCell: ({ props, context }) => {
      return {
        class: [
          'py-1',
        ]
      }
    },
    bodyCell: ({ props, context }) => {
      return {
        class: [
          { 'py-[0.105rem] px-1': true },
        ]
      }
    },
  }
};

const ENV_BASE_URL = '/api/envs'

const selectedMapId = ref();

const maps = computed(() => {
  return dataMaps.value.map((project) => {
    return {
      name: project.mapName,
      code: project.mapId
    }
  })
})

async function createProject() {
  try {
    await $fetch(ENV_BASE_URL, {
      method: 'POST',
      body: {
        envId: envId.value.replace(/[^a-zA-Z0-9]/g, ''),
        envName: envName.value,
        envOwner: 'admin',
        mapId: selectedMapId.value.code,
        projectId: projectId.value
      }
    })
    visibleProjectCreationDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: '프로젝트가 등록되었습니다.',
      life: 3000,
      group: 'br'
    });
  } catch (error) {
    console.error(error)
  } finally {
    envId.value = '';
    envName.value = '';
    refresh()
  }
}



async function deleteProject(projectId) {
  return $fetch(`${ENV_BASE_URL}/${projectId}`, {
    method: 'DELETE',
  })
}

const confirmDeleteProject = (event, projectId) => {
  confirm.require({
    target: event.currentTarget,
    header: 'Confirmation',
    message: projectId + '를 정말로 삭제 하시겠습니까?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      outlined: true,
      size: 'small',
    },
    acceptProps: {
      label: '삭제',
      size: 'small',
    },
    accept: async () => {
      toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000, group: 'br' });
      await deleteProject(projectId)
      refresh()
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000, group: 'br' });
    }
  });
};

</script>
