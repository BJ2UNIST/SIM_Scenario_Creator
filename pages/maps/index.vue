<template>
  <div class="p-2 bg-slate-200">
    지도 관리
  </div>
  <div class="flex flex-col gap-2 max-w-screen-lg m-auto">
    <div class="bg-white p-2 rounded flex flex-col gap-2">
      <div class="flex">
        <button @click.prevent="visibleProjectCreationDialog = true" class="hover:text-blue-500">
          <font-awesome-icon icon="fa fa-plus" /> 지도 등록
        </button>
      </div>
      <DataTable
        :value="maps" stripedRows showGridlines tableStyle="min-width: 50rem;"
        :pt="tablePt"
        :ptOptions="{ mergeProps: true }"
      >
        <Column field="mapId" header="아이디"></Column>
        <Column field="mapName" header="설명"></Column>
        <Column field="mapOwner" header="소유자"></Column>
        <Column field="createdAt" header="등록일">
          <template #body="{ data }">
            {{ toKST(data.createdAt) }}
          </template>
        </Column>
        <Column field="quantity" header="기능">
          <template #body="{ data }">
            <div class="flex gap-1 justify-center">
              <Button :to="`/maps/${data.mapId}`" as="router-link" size="small">
                설정
              </Button>
              <Button label="삭제" @click="confirmDeleteMap($event, data.mapId)" size="small">
                <font-awesome-icon icon="fa fa-x" /> 삭제
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="visibleProjectCreationDialog" modal header="지도 등록" class="min-w-96">
    <div class="mb-4">
      <InputText v-model="mapId" class="flex-auto w-full" autocomplete="off" placeholder="Enter Map ID" autofocus/>
    </div>
    <div class="mb-8">
      <InputText v-model="mapName" class="w-full" autocomplete="off" placeholder="Enter Map Description" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="취소" severity="secondary" size="small" @click="visibleProjectCreationDialog = false"/>
      <Button type="button" label="저장" size="small" severity="contrast" @click="createMap"/>
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

const mapId = ref('');
const mapName = ref('');

const { data: maps, refresh } = await useFetch("/api/maps", {})

const tablePt = {
  column: {
    headerCell: ({ props, context }) => {
      return {
        class: [
          'text-center justify-center items-center',
        ]
      }
    },
    columnheadercontent: () => {
      return {
        class: [
          'text-center justify-center items-center',
        ]
      }
    },
    bodyCell: ({ props, context }) => {
      return {
        class: [
          'py-[0.105rem]',
          'px-1',
          'text-center'
        ]
      }
    },
  }
};

async function createMap() {
  try {
    await $fetch('/api/maps', {
      method: 'POST',
      body: {
        mapId: mapId.value.replace(/\s/g, ''),
        mapName: mapName.value,
        mapOwner: 'admin'
      }
    })
    visibleProjectCreationDialog.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: '지도가 등록되었습니다.', life: 3000 , group: 'br'});

  } catch (error) {
    console.error(error)
  } finally {
    mapId.value = '';
    mapName.value = '';
    refresh()
  }
}

async function deleteMap(mapId) {
  return $fetch(`/api/maps/${mapId}`, {
    method: 'DELETE',
  })
}

const confirmDeleteMap = (event, mapId) => {
  confirm.require({
    target: event.currentTarget,
    header: '삭제확인',
    message: `지도 ${mapId} 를 정말로 삭제 하시겠습니까?`,
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
      await deleteMap(mapId)
      refresh()
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000, group: 'br' });
    }
  });
};

</script>
