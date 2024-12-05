<template>
  <div class="">
    <div class="p-1 flex justify-between items-center bg-slate-500 border-5 text-white">
      <div class="p-1">
        {{ projectId }} / {{ envId }}
      </div>
      <div class="flex gap-1 items-center">

        <div>
          <Select v-model="selectedMapId" @change="mapSelected" class="w-full" :options="maps"
            placeholder="사용할 베이스 환경을 선택하세요" optionLabel="name" />
        </div>
      </div>

      <div class="flex items-center">
        <Button @click="openSaveModal" label="저장" size="small" />
        <Button @click="confirmExit" label="닫기" size="small" />
      </div>
    </div>
    <div class="flex min-h-[calc(100vh-42px)] p-1- bg-slate-50">
      <ClientOnly fallback-tag="div">
        <MapView ref="mapview" class="flex-1" :mapId="mapId" :projectId="projectId" :envId="envId" />
        <template #fallback>
          <div class="p-5 text-2xl w-full ">
            <p><i class="pi pi-spin pi-spinner px-2"></i></p>
            <div>Loading Map Component...</div>
          </div>
        </template>
      </ClientOnly>

      <div class="flex flex-col gap-1 flex-none w-80 ml-1 bg-slate-200 p-1">
        <div class="p-2 bg-slate-200">
          <div>
            <Button @click="openEventDialog" label="이벤트 등록" class="w-full"/>
          </div>
          <div>
            이벤트 목록
            <div class="flex flex-col gap-1">
              <div v-for="event in events" :key="event.selectedEventType"
                class="flex justify-between bg-blue-400 text-white p-2 rounded">
                <div>
                  <button @click="findEvent(event)">{{ event.eventType }}</button>
                </div>
                <div>
                  <button @click="deleteEvent(event.id)">X</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="visibleProjectCreationDialog" modal header="저장하기" class="min-w-96">
      <div class="flex flex-col gap-2">
        <div class="">
          환경 ID:
          <InputText v-model="envId" class="flex-auto w-full" autocomplete="off" placeholder="고유 아이디를 입력하세요."
            autofocus />
        </div>
        <div class="">
          <InputText v-model="envName" class="w-full" autocomplete="off" placeholder="설명을 입력하세요." />
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" label="취소" severity="secondary" size="small"
            @click="visibleProjectCreationDialog = false" />
          <Button type="button" label="저장" size="small" severity="contrast" @click="createProject" />
        </div>
      </div>
    </Dialog>

    <Dialog v-model:visible="visibleAddEventDialog" modal header="이벤트 등록" class="min-w-96">
      <div class="flex flex-col gap-2">
        <div>
          <input type="text" v-model="event.id" disabled class="w-full border rounded"/>
          <div>
            이벤트 설명
          </div>
          <div>
            <InputText v-model="event.eventName" class="flex-auto w-full" autocomplete="off" placeholder="이벤트 설명 입력하세요."
              autofocus />
          </div>
        </div>
        <div>
          이벤트 타입:
          <Select v-model="event.selectedEventType" class="w-full" :options="eventTypes" placeholder="이벤트 타입 선택하세요"
            optionLabel="name" />
        </div>
        <div class="flex flex-col gap-1">
          <div>
            <div>
            이벤트 발생일
            </div>
            <input type="date" v-model="event.eventStartDate" class="border p-1 rounded w-full"/>
            <input type="time" v-model="event.eventStartTime" class="border p-1 rounded w-full"/>
          </div>
          <div>
            <div>
            이벤트 종료일
            </div>
            <input type="date" v-model="event.eventEndDate" class="border p-1 rounded w-full" />
            <input type="time" v-model="event.eventEndTime" class="border p-1 rounded w-full" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" label="취소" severity="secondary" size="small" @click="visibleAddEventDialog = false" />
          <Button type="button" label="저장" size="small" severity="contrast" @click="createEvent" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>

import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

definePageMeta({
  layout: 'mylayout',
})

const confirm = useConfirm();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const envId = ref(route.params.id);
const mapId = ref(route.query.mapId);
const projectId = ref(route.params.projectId);

const eventTypes = [
  { name: '교통사고', code: 'event-type1' },
  { name: '교량건설', code: 'event-type2' },
  { name: '행사', code: 'event-type3' }
]
const { $emit, $on, $off } = useNuxtApp()

const event = ref({
  id: '',
  eventName: '',
  selectedEventType: eventTypes[0],
  eventStartDate: '',
  eventEndDate: '',
  eventStartTime: '',
  eventEndTime: '',
})

const events = ref([])

const envName = ref('');
const visibleProjectCreationDialog = ref(false);
const visibleAddEventDialog = ref(false);

const selectedMapId = ref();

const { data: dataMaps, refresh: refreshProject } = await useFetch("/api/maps", {})
const maps = computed(() => {
  return dataMaps.value.map((obj) => {
    return {
      name: obj.mapName,
      code: obj.mapId
    }
  })
})

const mapview = ref()

const ENV_BASE_URL = '/api/envs'


// from map view
$on('event-click', (data) => {
  event.value = data
  visibleAddEventDialog.value = true;
})

function openEditEventDialog(event) {
  event.value = event
  visibleAddEventDialog.value = true;
}

function openEventDialog() {

  event.value = {
    id: Math.random().toString(36).substring(7),
    eventName: '사고_',
    selectedEventType: eventTypes[0],
    eventStartDate: '',
    eventEndDate: '',
    eventStartTime: '09:00:00',
    eventEndTime: '11:00:00'
  }

  visibleAddEventDialog.value = true;
}

function createEvent() {

  if (events.value.find(e => e.id === event.value.id)) {
    // updateEvent
    console.log('updte')
    return
  }

  const nEvent = {
    ...event.value,
    eventType: event.value.selectedEventType.name,
  }
console.log(nEvent.value)
   events.value = [
    ...events.value,
    nEvent
  ]
  visibleAddEventDialog.value = false;

  mapview.value.addEvent(nEvent)
}

function deleteEvent(eventId) {

  const idx = events.value.findIndex(event => event.id === eventId)

  if (idx >= 0) {
    events.value.splice(idx, 1)
    mapview.value.deleteEvent({ id: eventId })
  }
}

function findEvent(event) {
  event.value = event
  mapview.value.findEvent(event)
  console.log('find:', event)
  // openEditEventDialog(event)
}

function mapSelected() {
  mapId.value = selectedMapId.value.code
}

function openSaveModal() {
  if (mapId.value) {
    console.log('already created')
    console.log('save current state')
    return
  }
  visibleProjectCreationDialog.value = true;
}

function closeSaveModal() {
  visibleProjectCreationDialog.value = false;
}

onMounted(() => {
  console.log({
    mapId: mapId.value,
    envId: envId.value,
    projectId: projectId.value
  })
})


async function createProject() {
  try {
    await $fetch(ENV_BASE_URL, {
      method: 'POST',
      body: {
        envId: envId.value,
        envName: envName.value,
        envOwner: 'admin',
        mapId: 'map1',
        projectId: projectId.value
      }
    })

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
    closeSaveModal()
    // visibleProjectCreationDialog.value = false;
    // envName.value = '';
    // refresh()
  }
}

const confirmExit = () => {
  confirm.require({
    message: 'Are you sure you want to exit?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: 'Yes',
      icon: 'pi pi-check',
      severity: 'contrast',
      size: 'small'
    },
    accept: () => {
      router.back(-1)
    },
    reject: () => {
    }
  });
};

</script>
