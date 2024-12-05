<template>
  <div class="flex">
    <button @click="click" class="bg-gray-600 text-white px-1">
      {{ props.idx + 1 }} 현시
    </button>
    <div v-for="s in props.phase.state" :key="s" class=" border text-white text-center w-4 font-bold"
      :class="stateColor(s)">
      {{ s }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  phase: Object,
  idx: Number,
  nodeId: String
})

const emit = defineEmits(['phase:changed'])

function click() {
  emit('phase:changed', {
    nodeId: props.nodeId,
    phaseNum: props.idx
  })
}

function stateColor(state) {
  switch (state) {
    case 'r':
      return 'bg-red-500'
    case 'g':
      return 'bg-green-300'
    case 'G':
      return 'bg-green-500'
    default:
      return 'bg-gray-700'
  }
}

</script>
