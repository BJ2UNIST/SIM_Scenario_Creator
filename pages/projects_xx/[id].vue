<template>
  <div class="">
    <Menubar :model="menuItems" class="min-w-max h-10 border-b border-2 border-red-500 rounded-none bg-slate-50 " v-if="false">
      <template #start>
         <div class="font-bold">M</div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <div class="">{{ projectId }}</div>
          <button @click="confirmExit" class="w-8 h-8 hover:text-blue-500"  >
            <font-awesome-icon icon="fa fa-close" />
          </button>
        </div>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate" class="space-x-1">
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action" inert class="space-x-1">
          <span :class="item.icon" />
          <span class="ml-1">{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
        </a>
      </template>
    </Menubar>

    <div class="p-1 flex justify-between items-center bg-slate-300">
      <div class="p-1">
        <font-awesome-icon icon="fa fa-bars" />
      </div>
      <div class="flex gap-1 items-center">
        <Button label="노드 업로드" @click="showUploadPopup('node')" size="small"  />
        <Button label="노드 삭제" @click="confirmDelete('node')" size="small" />
        <Button label="엣지 업로드" @click="showUploadPopup('edge')" size="small" />
        <Button label="엣지 삭제" @click="confirmDelete('edge')" size="small" />
      </div>
      <div class="flex items-center ">
        <Button text>
          <font-awesome-icon icon="fa fa-download" />
        </Button>
        <Button @click="confirmExit" text>
          <font-awesome-icon icon="fa fa-close" />
        </Button>
      </div>
    </div>
    <div class="flex min-h-[calc(100vh-42px)] p-1- bg-slate-50">
      <ClientOnly fallback-tag="div">
        <MapView ref="mapview" class="flex-1" :projectId="projectId" />
        <template #fallback>
          <div class="p-5 text-2xl w-full ">
            <p><i class="pi pi-spin pi-spinner px-2"></i></p>
            <div>Loading Map Component...</div>
          </div>
        </template>
      </ClientOnly>

      <div class="flex flex-col gap-1 flex-none w-80 ml-1 bg-slate-200 p-1 border">
        <div class="p-2 bg-slate-400">
          <div class="flex space-x-1 ">
            <Button size="small">
              다운로드
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="isUploadPopupVisible" modal header="파일 업로드" @hide="cancleUpload">
      <div class="flex flex-col gap-2 items-center- mb-4">
        <Select v-model="selectedType" :options="types" optionLabel="name" placeholder="Select a Type" class="w-full" />
        <div v-if="!files.length || files.length < 2" class="p-2 w-full" >
          <p>.shp 과 .dbf 파일을 모두 선택하세요.</p>
        </div>
        <InputText type="file" multiple @input="handleFileInput" accept=".shp, .dbf" />
        <div class="flex flex-col">
          <div v-for="f in files" :key="f.name">
            {{ f.name }} {{ f.size/1000 }}Kb
          </div>
        </div>
        <Button v-if="files.length > 1" @click="upload" label="업로드" />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { PrimeIcons } from '@primevue/core/api';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

definePageMeta({
  layout: false,
})

function cancleUpload() {
  files.value = []
}

const menuItems = ref([
  {

    label: '프로젝트 목록',
    route: '/projects',

  },
  {
    label: '링크',
    items: [
      {
        label: 'Shapefile 업로드',
        icon: PrimeIcons.PLUS,
        command: () => showUploadPopup('edge')
      },
      {
        label: '삭제',
        icon: PrimeIcons.TRASH,
        command() {
          confirmDelete('edge')
        }
      },
    ]
  },
  {
    label: '내보내기',
  },
])
const confirm = useConfirm();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { handleFileInput, files } = useFileStorage()

const projectId = computed(() => route.params.id);
const isUploadPopupVisible = ref(false);
const mapview = ref()
const selectedType = ref();

const types = ref([
  { name: '노드', code: 'node' },
  { name: '엣지', code: 'edge' },
]);

const toastInfo = (detail) => {
  toast.add({ severity: 'info', summary: 'Success', detail, group: 'br', life: 1000 });
}

const toastError = (detail) => {
  toast.add({ severity: 'error', summary: 'Error', detail, life: 1000 });
}

function showUploadPopup(type) {
  selectedType.value = types.value.find((t) => t.code === type)
  isUploadPopupVisible.value = true
}

async function upload() {
  if (!files.value.length) {
    toastError('파일을 선택해주세요.')
    return
  }

  try {
    await $fetch('/api/files', {
      method: 'POST',
      body: {
        files: files.value,
        projectId: projectId.value,
        type: selectedType.value.code
      }
    })

    mapview.value.updateEdges()
    mapview.value.updateNodes()

    toastInfo('파일 업로드 성공.')
  } catch (e) {
    console.error(e)
    toastError('파일 업로드 실패.')
  } finally {
    isUploadPopupVisible.value = false
  }
}

const deleteNodes = async () => {
  try {
    await $fetch(`/api/nodes/${projectId.value}`, { method: 'DELETE' })
    mapview.value.updateNodes()
    toastInfo('노드 삭제 성공.')
  } catch (e) {
    console.error(e)
    toastError('노드 삭제 실패.')
  }
}

const deleteEdges = async () => {
  try {
    await $fetch(`/api/edges/${projectId.value}`, { method: 'DELETE' })
    mapview.value.updateEdges()
    toastInfo('엣지 삭제 성공.')
  } catch (e) {
    console.error(e)
    toastError('엣지 삭제 실패.')
  }
}

const confirmDelete = (type) => {
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
      router.push('/projects')
    },
    reject: () => {

    }
  });
};

</script>
