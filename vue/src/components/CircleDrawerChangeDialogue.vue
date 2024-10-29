<script setup>
import { ref, onMounted } from "vue";

const props = defineProps(["circle", "x", "y"]);
const emit = defineEmits(["change-radius", "change-radius-done"]);

const divEl = ref(null);
const radius = ref(0);

onMounted(() => {
  radius.value = props.circle.r;
  divEl.value.style.top = `${props.y}px`;
  divEl.value.style.left = `${props.x}px`;
});
</script>

<template>
  <div v-if="circle" ref="divEl">
    <p>Change radius of circle at ({{ circle.x }}, {{ circle.y }})</p>
    <label for="radius-input">Radius: {{ circle.r }}px</label>
    <input 
      id="radius-input" 
      type="range" 
      min="1" 
      max="100" 
      v-model.number="radius"
      @input="$emit('change-radius', radius)"
      @change="$emit('change-radius-done', radius)"
    >
  </div>
</template>

<style scoped>
div {
  border: 1px solid black;
  width: 20rem;
  height: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  background: white;
}

div p,
div label {
  text-align: center;
  margin-bottom: 0;
}

div input {
  margin: auto 1rem;
}
</style>
