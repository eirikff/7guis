<script setup>
import { ref, computed, onMounted } from "vue";

const data = ref([
  { id: 1, firstname: "Hans", lastname: "Emil" },
  { id: 2, firstname: "Max", lastname: "Mustermann" },
  { id: 3, firstname: "Roman", lastname: "Tisch" },
]);
let newId = 4;

const prefixFilter = ref("");

const selectPersonEl = ref(null);
const selectedPersonId = ref(null);

const firstnameInput = ref("");
const lastnameInput = ref("");

const createAllowed = computed(() => {
  return firstnameInput.value.length > 0 && lastnameInput.value.length > 0;
});

const filteredData = computed(() => {
  if (prefixFilter.value.length > 0) {
    return data.value.filter((item) => item.lastname.toLowerCase().includes(prefixFilter.value.toLowerCase()))
  }
  else {
    return data.value;
  }
});

function addPerson() {
  data.value.push({
    id: newId++,
    firstname: firstnameInput.value,
    lastname: lastnameInput.value,
  });
  firstnameInput.value = "";
  lastnameInput.value = "";
}

function updateNameInputs() {
  const person = data.value.find((item) => item.id === selectedPersonId.value);
  if (person) {
    firstnameInput.value = person.firstname;
    lastnameInput.value = person.lastname;
  }
  else {
    firstnameInput.value = "";
    lastnameInput.value = "";
  }
}

function updatePerson() {
  const personIdx = data.value.findIndex((item) => item.id === selectedPersonId.value);
  data.value[personIdx].firstname = firstnameInput.value;
  data.value[personIdx].lastname = lastnameInput.value;
}

function deletePerson() {
  data.value = data.value.filter((item) => item.id !== selectedPersonId.value);
  selectedPersonId.value = null;
  updateNameInputs();
}

onMounted(() => {
  document.addEventListener("click", function(event) {
    if (event.target.id === "select-person") {
      if (selectPersonEl.value) {
        selectPersonEl.value.selectedIndex = -1;
        selectedPersonId.value = null;
        updateNameInputs();
      }
    }
  });
});
</script>

<template>
  <h1>CRUD</h1>

  <label for="filter-prefix">Filter prefix: </label>
  <input type="text" id="filter-prefix" v-model="prefixFilter">

  <div>
    <select 
      id="select-person" 
      size="5" 
      ref="selectPersonEl"
      v-model="selectedPersonId"
      @change="updateNameInputs"
    >
      <option v-for="person in filteredData" :key="person.id" :value="person.id">
        {{ person.lastname }}, {{ person.firstname }}
      </option>
    </select>

    <div>
      <div>
        <label for="input-firstname">First name: </label>
        <input type="text" id="input-firstname" v-model="firstnameInput">
      </div>

      <div>
        <label for="input-lastname">Last name: </label>
        <input type="text" id="input-lastname" v-model="lastnameInput">
      </div>
    </div>

    <div class="control-buttons">
      <button
        :disabled="!createAllowed"
        @click="addPerson"
      >Create</button>

      <button
        :disabled="!selectedPersonId"
        @click="updatePerson"
      >Update</button>

      <button
        :disabled="!selectedPersonId"
        @click="deletePerson"
      >Delete</button>
    </div>
  </div>
</template>

<style scoped>
select {
  overflow-y: auto;
}

.control-buttons button {
  margin: 5px 10px 5px 0;
}
</style>
