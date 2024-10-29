<script setup>
import { ref, onMounted, nextTick } from 'vue';
import CircleDrawerChangeDialogue from "./CircleDrawerChangeDialogue.vue";

const defaultRadius = 25;

const canvasEl = ref(null);
const context = ref(null);

let circleId = 0;
const circles = ref([]);
const selectedCircle = ref(null);

onMounted(() => {
  canvasEl.value.setAttribute("width", canvasEl.value.offsetWidth);
  canvasEl.value.setAttribute("height", canvasEl.value.offsetHeight);
  context.value = canvasEl.value.getContext("2d");
});

function computeRelativeMousePosition(event) {
  const { x: cx, y: cy } = event.target.getBoundingClientRect();
  const { clientX: px, clientY: py } = event;
  const mx = Math.floor(px - cx);
  const my = Math.floor(py - cy);

  return {
    x: mx,
    y: my,
  };
}

function drawCircles() {
  context.value.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);

  for (const circle of circles.value) {
    context.value.beginPath();
    context.value.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    if (circle.fill || circle.id === selectedCircle.value?.id) {
      context.value.fillStyle = "lightblue";
      context.value.fill();
    }
    context.value.lineWidth = 2;
    context.value.strokeStyle = "#000000";
    context.value.stroke();
  }
}

function addCircle(event) {
  // Deselect circle if one is selected, but don't add a new circle 
  if (selectedCircle.value) {
    selectedCircle.value = null;
    drawCircles();
    return;
  }

  // compute relative click position inside canvas
  const { x, y } = computeRelativeMousePosition(event);

  const circle = {
    id: circleId++,
    x: x,
    y: y,
    r: defaultRadius,
    fill: true,
  };
  circles.value.push(circle);
  drawCircles();
}

function highlightClosestCircle(event) {
  const { x, y } = computeRelativeMousePosition(event);

  for (const circle of circles.value) {
    const dx = x - circle.x;
    const dy = y - circle.y;
    const d2 = dx * dx + dy * dy;
    const r2 = circle.r * circle.r;

    if (d2 <= r2) {
      circle.fill = true;
    }
    else {
      circle.fill = false;
    }
  }

  drawCircles();
}

async function openChangeDialogue(event) {
  selectedCircle.value = null;

  // nextTick updates the ChangeDialogue component since it depends on the
  // value of selectedCircle, thus briefly removing the object
  await nextTick();

  for (const circle of circles.value.reverse()) {
    if (circle.fill) {
      selectedCircle.value = circle;
      selectedCircle.value.clientX = event.clientX;
      selectedCircle.value.clientY = event.clientY;
      break;
    }
  }

  drawCircles();
}

async function updateRadius(radius) {
  selectedCircle.value.r = radius;
  drawCircles();
}

function undo() {
  console.log("undo");
}

function redo() {
  console.log("redo");
}
</script>

<template>
  <h1>Circle drawer</h1>

  <div>
    <button
      @click="undo"
    >Undo</button>
    <button
      @click="redo"
    >Redo</button>
  </div>

  <div>
    <canvas 
      id="circles" 
      ref="canvasEl"
      @click="addCircle"
      @mousemove="highlightClosestCircle"
      @contextmenu.prevent="openChangeDialogue"
    ></canvas>
  </div>

  <CircleDrawerChangeDialogue 
    v-if="selectedCircle"
    :circle="selectedCircle" 
    :x="selectedCircle.clientX"
    :y="selectedCircle.clientY"
    @change-radius="updateRadius"
  />

</template>

<style scoped>
#circles {
  width: 80vw;
  height: 60vh;
  border: 1px solid black;
}
</style>
