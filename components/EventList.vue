<template>
  <div class="p-1 rounded border flex flex-col gap-2">
    <div class="flex flex-col gap-1">
      <div class="flex gap-1 ">
        <button v-tooltip.top="item.name" class="border w-8 h-8 rounded bg-slate-500 text-slate-50 hover:bg-slate-400" v-for="item in eventTypes"
          :key="item.code">
          <font-awesome-icon :icon="item.icon" />
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-1 bg-slate-300 rounded-lg">
      <div v-for="event in events" :key="event.id">
        <div class="flex items-center justify-between gap-1 border-b p-1 px-2 rounded">
          <div class="flex space-x-1">
            <div>
              {{ event.name }}
            </div>
          </div>
          <div class="space-x-1 w-max flex">
            <Button class="btn hover:cursor-pointer hover:text-blue-300" @click="visible = true" size="small">
              <font-awesome-icon icon="fa-info" />
            </Button>
            <Button class="btn hover:cursor-pointer hover:text-blue-300" @click="confirmDelete($event)" size="small">
              <font-awesome-icon icon="fa-xmark" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Dialog v-model:visible="visible" modal header="이벤트 속성" :style="{ width: '25rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">이벤트 속성 변경</span>
    <div class="flex items-center gap-4 mb-4">
      <label for="startdate" class="font-semibold w-24">시작일</label>
      <InputText type="date" id="startdate" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-8">
      <label for="enddate" class="font-semibold w-24">종료일</label>
      <InputText type="date" id="enddate" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
      <Button type="button" label="Save" @click="visible = false"></Button>
    </div>
  </Dialog>

</template>

<script setup>
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const visible = ref(false)
const eventTypes = ref([
  { name: '교통사고', code: 'accident', icon: 'fas fa-car-burst' },
  { name: '공사', code: 'construction', icon: 'fas fa-person-digging' },
  { name: '우회', code: 'event', icon: 'fas fa-route' },
]);

const events = [
  {
    id: 1,
    name: '교통사고',
    type: 'accident',
  },
  {
    id: 2,
    name: '공사',
    type: 'construction',
  },
  {
    id: 3,
    name: '우회',
    type: 'event',
  }
]

const confirmDelete = (event, type) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Are you sure you want to proceed?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Yes',
    },
    accept: () => {

    },
    reject: () => {

    }
  });
};

</script>
