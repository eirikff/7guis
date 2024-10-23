<script setup>
</script>

<template>
  <nav>
    <ul>
      <li><RouterLink :to="{ name: 'home' }">Home</RouterLink></li>
      <li><RouterLink :to="{ name: 'counter' }">Counter</RouterLink></li>
      <li><RouterLink :to="{ name: 'temperature-converter' }">Temperature converter</RouterLink></li>
      <li><RouterLink :to="{ name: 'flight-booker' }">Flight booker</RouterLink></li>
      <li><RouterLink :to="{ name: 'timer' }">Timer</RouterLink></li>
      <li><RouterLink :to="{ name: 'crud' }">CRUD</RouterLink></li>
      <li><RouterLink :to="{ name: 'circle-drawer' }">Circle drawer</RouterLink></li>
      <li><RouterLink :to="{ name: 'cells' }">Cells</RouterLink></li>
    </ul>
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
</style>
