<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >
    <q-btn @click="calculate"> calculate</q-btn>
    <q-btn @click="start"> start</q-btn>
    <q-btn @click="stop"> stop</q-btn>
  </q-page>
</template>

<script>
import { explain } from 'src/boot/explain';
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  methods: {
    calculate() {
      explain.calculate(20);
    },
    start() {
      explain.start();
    },
    stop() {
      explain.stop();
    }
  }
})
</script>
