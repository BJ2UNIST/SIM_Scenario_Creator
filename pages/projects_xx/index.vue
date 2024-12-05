<template>
  <div class="flex flex-col gap-2 max-w-screen-lg m-auto">

    <div class="p-3 text-red-500 border border-dashed mt-2 border-spacing-2 border-red-500 rounded-lg">
      이 페이지는 관리자 권한이 있는 사용자만 접근할 수 있습니다.
    </div>
    <div class="bg-white p-2 rounded flex flex-col gap-2">
      <div class="flex">
        <button @click.prevent="visibleProjectCreationDialog = true" class="btn">
          <font-awesome-icon icon="fa fa-plus" />
        </button>
      </div>
      <DataTable :value="projects" stripedRows showGridlines tableStyle="min-width: 50rem;" :pt="tablePt"
        :ptOptions="{ mergeProps: true }">
        <Column field="projectId" header="아이디"></Column>
        <Column field="projectName" header="설명"></Column>
        <Column field="projectOwner" header="소유자"></Column>
        <Column field="createdAt" header="등록일">
          <template #body="{ data }">
            {{ toKST(data.createdAt) }}
          </template>
        </Column>
        <Column field="quantity" header="기능">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button :to="`/projects/${data.projectId}`" class="btn" as="router-link">
                <font-awesome-icon icon="fa fa-edit" />
              </Button>
              <Button label="삭제" @click="confirmDeleteProject($event, data.projectId)" class="btn">
                <font-awesome-icon icon="fa fa-x" />
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="visibleProjectCreationDialog" modal header="프로젝트 등록" class="min-w-96">
    <div class="mb-4">
      <InputText v-model="projectId" class="flex-auto w-full" autocomplete="off" placeholder="Enter Project ID" autofocus/>
    </div>
    <div class="mb-8">
      <InputText v-model="projectName" class="w-full" autocomplete="off" placeholder="Enter Project Description" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="취소" severity="secondary" size="small" @click="visibleProjectCreationDialog = false"/>
      <Button type="button" label="저장" size="small" severity="contrast" @click="createProject"/>
    </div>
  </Dialog>
</template>

<style>
.btn {
  @apply w-8 h-8 flex justify-center items-center;
}
</style>

<script setup>

import dayjs from 'dayjs';

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const toKST = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');

const visibleProjectCreationDialog = ref(false);
const confirm = useConfirm();
const toast = useToast();

const projectId = ref('');
const projectName = ref('');

const { data: projects, refresh } = await useFetch("/api/projects", {})

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

async function createProject() {
  try {
    await $fetch('/api/projects', {
      method: 'POST',
      body: {
        projectId: projectId.value.replace(/[^a-zA-Z0-9]/g, ''),
        projectName: projectName.value,
        projectOwner: 'admin'
      }
    })
    visibleProjectCreationDialog.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: '프로젝트가 등록되었습니다.', life: 3000 , group: 'br'});

  } catch (error) {
    console.error(error)
  } finally {
    projectId.value = '';
    projectName.value = '';
    refresh()
  }
}

async function deleteProject(projectId) {
  return $fetch(`/api/projects/${projectId}`, {
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
      console.log(event)
      await deleteProject(projectId)
      refresh()
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000, group: 'br' });
    }
  });
};

</script>
