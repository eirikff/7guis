<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <h1>Counter</h1>

  <input type="number" v-model="count" />
  <button @click="increment">Increment</button>
</template>

<style scoped>
</style>
