<script setup>
import { ref, computed } from "vue";

const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

const oneWay = ref(true);
const departureDate = ref(today);
const returnDate = ref(today);

const departureDateValue = computed(() => {
  return departureDate.value.toISOString().split("T")[0];
});

const returnDateValue = computed(() => {
  return returnDate.value.toISOString().split("T")[0];
});

function bookFlight() {
  if (oneWay.value) {
    alert(`You booked a one-way flight leavning on ${departureDate.value.toDateString()}.`)
  }
  else {
    alert(`You booked a return flight leaving on ${departureDate.value.toDateString()} and returning on ${returnDate.value.toDateString()}.`)
  }
}

departureDate.value.setUTCHours(0, 0, 0);
returnDate.value.setUTCHours(0, 0, 0);
</script>

<template>
  <h1>Flight booker</h1>

  <div class="flight-booker-wrapper">
    <select id="trip-type" v-model="oneWay">
      <option :value="true">One-way flight</option>
      <option :value="false">Return flight</option>
    </select>

    <div>
      <label for="departure-date">Departure: </label>
      <input 
        id="departure-date" 
        type="date" 
        :value="departureDateValue"
        @input="departureDate = new Date($event.target.value)"
        :max="oneWay ? '' : returnDateValue"
      >
    </div>

    <div>
      <label for="return-date">Return: </label>
      <input 
        id="return-date" 
        type="date" 
        :value="returnDateValue" 
        @input="returnDate = new Date($event.target.value)"
        :disabled="oneWay"
        :min="departureDateValue"
      >
    </div>

    <button
      :disabled="returnDate < departureDate"
      @click="bookFlight"
    >Book</button>
  </div>
</template>

<style scoped>
</style>
