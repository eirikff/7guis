<script setup>
import { ref, computed, toRaw } from "vue";

const emit = defineEmits(["undo", "redo"]);

let history = ref([]);
let currentHistoryIndex = ref(-1);
let historyId = 0;

const undoAvailable = computed(() => {
  return currentHistoryIndex.value > 0;
});

const redoAvailable = computed(() => {
  return currentHistoryIndex.value < history.value.length - 1;
});

function push(state) {
  // if we have newer history, remove it since we're branching here
  if (currentHistoryIndex.value !== history.value.length - 1) {
    history.value = history.value.slice(0, currentHistoryIndex.value + 1);
  }

  history.value.push({
    id: historyId++,
    state: structuredClone(toRaw(state)),
  });
  currentHistoryIndex.value++;
}

function pop() {
  if (currentHistoryIndex.value === 0) {
    return current();
  }
  else if (currentHistoryIndex.value < 0) {
    return null;
  }
  return history.value[currentHistoryIndex.value--];
}

function current() {
  if (currentHistoryIndex.value >= 0 && currentHistoryIndex.value < history.value.length) {
    return history.value[currentHistoryIndex.value];
  }
  else {
    return null;
  }
}

function undo() {
  pop();
  const historyEvent = current();
  if (!historyEvent) {
    return;
  }

  emit("undo", toRaw(historyEvent));
}

function redo() {
  if (currentHistoryIndex.value < 0) {
    return;
  }
  else if (currentHistoryIndex.value === history.value.length - 1) {
    return;
  }

  const historyEvent = history.value[++currentHistoryIndex.value];
  emit("redo", toRaw(historyEvent));
}

defineExpose({
  push,
});
</script>

<template>
  <div>
    <button
      @click="undo"
      :disabled="!undoAvailable"
    >Undo</button>
    <button
      @click="redo"
      :disabled="!redoAvailable"
    >Redo</button>
  </div>
</template>

<style scoped>
</style>
