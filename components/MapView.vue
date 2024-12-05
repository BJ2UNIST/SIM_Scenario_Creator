<template>
  <div>
    <div id="map" class="map" @wheel="onWheel" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtApp } from '#app'
import * as maptalks from 'maptalks'
import { useToast } from 'primevue/usetoast'

import { createMap } from '~/mapeditor/map.manager'
import JunctionManager from '~/mapeditor/junction.manager';
import EventManager from '~/mapeditor/event.manager';

import type { Emit, On } from '~/mapeditor/events'

const toast = useToast();
const props = defineProps({
  mapId: String,
  projectId: String,
  envId: String,
  type: String // base: means basic map
})

const { $emit, $on, $off } = useNuxtApp() as NuxtApp & {
  $emit: Emit
  $on: On
  $off: (event: string, callback: Function) => void
}

let map: maptalks.Map | null = null

const error = (summary: string, detail: string = '') => {
  toast.add({ severity: 'error', summary, detail, group: 'bl', life: 5000 });
}

const info = (summary: string, detail: string = '') => {
  toast.add({ severity: 'info', summary, detail, group: 'bl', life: 5000 });
}

let manager: any
let eventManager: any
onMounted(async () => {
  const { map: m }= createMap()
  map = m

  const nodes = await getNodes()
  const edges = await getEdges()

  if (props.mapId === undefined) {
    console.error('mapId is not defined')
    return
  }

  if (props.envId || props.type === 'base') {
    manager = JunctionManager(map, {
      mapId: props.mapId,
      projectId: props.projectId,
      envId: props.envId
    }, $emit, $on, $off)

    manager.loadNodes(nodes)

    info('노드를 로딩했습니다.')
    manager.loadEdges(edges)
    info('링크를 로딩했습니다.')

    map.setCenter(manager.getCenter())
  }

  eventManager = EventManager(map, {
    mapId: props.mapId,
    projectId: props.projectId,
    envId: props.envId
  }, $emit, $on, $off)


  // map?.setCenter(nodes[Math.floor(nodes.length/2)].geometry.coordinates)
  // map.animateTo({
  //   center: manager.getCenter(),
  // }, {
  //   duration: 1000
  // })
})

async function getEdges() {
  return $fetch<any[]>(`/api/edges/${props.mapId}`)
}

async function getNodes() {
  return $fetch<any[]>(`/api/nodes/${props.mapId}`)
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 1 : -1;
  if (delta > 0) {
    map?.zoomOut()
  } else {
    map?.zoomIn()
  }
}

async function updateNodes() {
  const nodes = await getNodes()
  if (manager) {
    manager.loadNodes(nodes)
    map?.setCenter(manager.getCenter())
  }
}

async function updateEdges() {
  const edges = await getEdges()
  if (manager) {
    manager.loadEdges(edges)
    map?.setCenter(manager.getCenter())
  }
}

async function addEvent(event: any) {
  if (!eventManager) {
    return
  }
  eventManager.addEvent(event)
}

async function deleteEvent(event: any) {
  if (!eventManager) {
    return
  }
  eventManager.deleteEvent(event)
}

async function findEvent(event:any) {
  if (!eventManager) {
    return
  }
  eventManager.findEvent(event)
}

defineExpose({
  updateNodes,
  updateEdges,
  addEvent,
  deleteEvent,
  findEvent
});

</script>

<style scoped>
.map {
  height: 100%;
}
</style>
