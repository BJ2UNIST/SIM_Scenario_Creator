<template>
  <div class="">
    <div class="p-1 flex justify-between items-center bg-slate-50">
      <div class="p-1">
        지도편집: {{ mapId }}
      </div>
      <div class="flex gap-1 items-center">

      </div>
      <div class="flex items-center ">
        <Button @click="confirmExit" text>
          <font-awesome-icon icon="fa fa-close" />
        </Button>
      </div>
    </div>
    <div class="flex min-h-[calc(100vh-42px)] p-1- bg-slate-50">
      <ClientOnly fallback-tag="div">
        <MapView ref="mapview" class="flex-1" :mapId="mapId" type="base"/>
        <template #fallback>
          <div class="p-5 text-2xl w-full ">
            <p><i class="pi pi-spin pi-spinner px-2"></i></p>
            <div>Loading Map Component...</div>
          </div>
        </template>
      </ClientOnly>

      <div class="flex flex-col gap-1 flex-none w-80 ml-1 bg-slate-200 p-1 border">
        <div class="p-1">
          <div class="grid grid-cols-1 gap-1">

            <Button label="zip 파일 업로드" @click="showUploadPopup('scenario')" size="small" />

            <!-- <Button label="노드 업로드" @click="showUploadPopup('node')" size="small" /> -->
            <!-- <Button label="노드 삭제" @click="confirmDelete('node')" size="small" /> -->
            <!-- <Button label="엣지 업로드" @click="showUploadPopup('edge')" size="small" /> -->
            <!-- <Button label="엣지 삭제" @click="confirmDelete('edge')" size="small" /> -->
            <!-- <Button class="col-span-2" label="커넥션 자동생성" size="small"/> -->
            <!-- <Button class="col-span-2" label="환경 내보내기" @click="exportEnv" size="small"/> -->
          </div>
        </div>
        <div class="p-1">
          <div>
            교차로: {{ nodeId || "-" }}
          </div>
          <div>
            현시
          </div>
          <div class="flex flex-col gap-1">
            <div v-for="(phase, idx) in phases" :key="phase.state">
              <SignalPhase :phase="phase" :idx="idx" :nodeId="nodeId" @phase:changed="phaseChanged" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="isUploadPopupVisible" modal header="파일 업로드" @hide="cancleUpload">
      <div class="flex flex-col gap-2 items-center- mb-4">
        <!-- <Select v-model="selectedType" :options="types" optionLabel="name" placeholder="Select a Type" class="w-full" />
        <div v-if="!files.length || files.length < 2" class="p-2 w-full" >
          <p>.shp 과 .dbf 파일을 모두 선택하세요.</p>
        </div> -->
        <InputText type="file" multiple @input="handleFileInput" accept=".shp, .dbf, .zip" />
        <div class="flex flex-col">
          <div v-for="f in files" :key="f.name">
            {{ f.name }} {{ f.size/1000 }}Kb
          </div>
        </div>
        <Button v-if="files.length >= 1" @click="upload" label="업로드" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { NuxtApp } from '#app'
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

import type { Emit, On } from "../../mapeditor/events";

definePageMeta({
  layout: false,
})

const { $emit, $on } = useNuxtApp() as NuxtApp & {
  $emit: Emit
  $on: On
}

interface Phase {
  state: string
  duration: number
}


const phases = ref<Phase[]>([])
const nodeId = ref('')

$on('junction:signal:loaded', (data:any) => {
  nodeId.value = data.nodeId
  phases.value = data.schedule.phase
})

$on('junction:closed', (data:any) => {
  nodeId.value = ''
  phases.value = []
})

function phaseChanged(data: any) {
  $emit(`junction:phase:change:${nodeId.value}`, data)
}


const confirm = useConfirm();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { handleFileInput, files } = useFileStorage()

const mapId = computed(() => route.params.id as string);
const isUploadPopupVisible = ref(false);
const mapview = ref()
const selectedType = ref();

const types = ref([
  { name: '노드', code: 'node' },
  { name: '엣지', code: 'edge' },
]);

const info = (detail:string) =>
  toast.add({ severity: 'info', summary: 'Success', detail, group: 'br', life: 1000 });

const error = (detail:string) =>
  toast.add({ severity: 'error', summary: 'Success', detail, group: 'br', life: 1000 });

function showUploadPopup(type: string) {
  selectedType.value = types.value.find((t) => t.code === type)
  isUploadPopupVisible.value = true
}

async function upload() {
  if (!files.value.length) {
    info('파일을 선택해주세요.')
    return
  }

  try {
    await $fetch('/api/files', {
      method: 'POST',
      body: {
        files: files.value,
        projectId: mapId.value,
        mapId: mapId.value,
        // type: selectedType.value.code
      }
    })

    mapview.value.updateEdges()
    mapview.value.updateNodes()

    info('파일 업로드 성공.')
  } catch (e) {
    console.error(e)
    error('파일 업로드 실패.')
  } finally {
    isUploadPopupVisible.value = false
  }
}

const deleteNodes = async () => {
  try {
    // await $fetch(`/api/nodes/${mapId.value}`, { method: 'DELETE' })
    await $fetch(`/api/nodes?mapId=${mapId.value}`, {
      method: 'DELETE'
    })
    mapview.value.updateNodes()
    info('노드 삭제 성공.')
  } catch (e) {
    console.error(e)
    error('노드 삭제 실패.')
  }
}

const deleteEdges = async () => {
  try {
    // await $fetch(`/api/edges/${mapId.value}`, { method: 'DELETE' })
    await $fetch(`/api/edges?mapId=${mapId.value}`, {
      method: 'DELETE'
    })

    mapview.value.updateEdges()
    info('엣지 삭제 성공.')
  } catch (e) {
    console.error(e)
    error('엣지 삭제 실패.')
  }
}

function cancleUpload() {
  files.value = []
}

const confirmDelete = (type: string) => {
  confirm.require({
    header: 'Confirmation',
    message: type + '를 정말로 삭제 하시겠습니까?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: 'Yes',
      severity: 'contrast',
      size: 'small'
    },
    accept: () => {
      if (type === 'node') deleteNodes()
      else
        deleteEdges()
    },
    reject: () => {

    }
  });
};

const confirmExit = () => {
  confirm.require({
    header: '확인',
    message: '정말로 나가시겠습니까?',
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
      router.push('/maps')
    },
    reject: () => {

    }
  });
};

function download(blog: Blob) {
  const url = window.URL.createObjectURL(blog)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = 'env.zip'
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}

async function exportEnv() {
  try {
    const response: Blob = await $fetch('/api/export', {
      method: 'POST',
      responseType: 'blob',
      body: {
        mapId: mapId.value.replace(/[^a-zA-Z0-9]/g, ''),
      }
    })

    download(response)

    info('시나리오 내보내기 성공.')
    console.log(response)
  } catch (e) {
    console.error(e)
    error('시나리오 내보내기 실패.')
  }

}
</script>
