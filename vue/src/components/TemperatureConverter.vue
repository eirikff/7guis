<script setup>
import { ref, computed } from 'vue';

const autofocus = true;

const celsius = ref(0);
const fahrenheit = ref(0);

function celsiusToFahrenheit(event) {
  if (event) {
    celsius.value = parseFloat(event.target.value);
  }
  fahrenheit.value = celsius.value * (9/5) + 32;
}

function fahrenheitToCelsius(event) {
  if (event) {
    fahrenheit.value = parseFloat(event.target.value);
  }
  celsius.value = (fahrenheit.value - 32) / (5/9);
}

function round(number, places) {
  if (places === 0) {
    return Math.round(number);
  }

  const rounded = Number(Math.round(number + `e${places}`) + `e-${places}`);
  return rounded;
}

const celsiusDisplay = computed(() => {
  return round(celsius.value, 1);
});

const fahrenheitDisplay = computed(() => {
  return round(fahrenheit.value, 1);
});

celsiusToFahrenheit();
</script>

<template>
  <h1>Temperature converter</h1>

  <input type="number" :value="celsiusDisplay" @input="celsiusToFahrenheit" :autofocus step="0.1">
  <span>&deg;C</span>
  <span> = </span>
  <input type="number" :value="fahrenheitDisplay" @input="fahrenheitToCelsius" step="0.1">
  <span>&deg;F</span>
</template>

<style scoped>
input {
  width: 6rem;
}
</style>
