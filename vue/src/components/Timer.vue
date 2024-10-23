<script setup>
import { ref, onMounted } from "vue";

const max_duration = 10;

const duration = ref(2);
const elapsed = ref(1);

let timerId = null;

function startTimer() {
  if (timerId === null && elapsed.value < duration.value) {
    timerId = setInterval(() => {
      elapsed.value += 0.1;

      if (elapsed.value > duration.value && timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }, 100);
  }
}

function reset() {
  elapsed.value = 0;
  startTimer();
}

onMounted(() => {
  reset();
})
</script>

<template>
  <h1>Timer</h1>

  <div>
    <div>
      <label for="elapsed-time">Elapsed time: </label>
      <progress 
        id="elapsed-time" 
        :value="elapsed" 
        :max="duration"
      >{{ elapsed }}</progress>
      <span>{{ elapsed.toFixed(1) }} s</span>
    </div>

    <div class="duration-wrapper">
      <label for="duration">Duration: </label>
      <input 
        id="duration" 
        type="range" 
        min="0" 
        :max="max_duration" 
        step="0.1"
        v-model.number="duration"
        @input="startTimer"
      >
      <span>{{ duration }} s</span>
    </div>

    <button
      @click="reset"
    >Reset</button>
  </div>
</template>

<style scoped>
progress {
  margin: 0 5px;
}
</style>
