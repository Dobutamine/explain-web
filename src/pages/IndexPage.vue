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
    <q-btn @click="getState"> state</q-btn>
    <q-btn @click="enable"> enable</q-btn>
    <q-btn @click="disable"> disable</q-btn>
    <q-btn @click="call"> call</q-btn>
    <q-btn @click="add_to_watchlist"> add watch</q-btn>
  </q-page>
</template>

<script>
import { explain } from 'src/boot/explain';
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  methods: {
    calculate() {
      explain.calculate(60);
    },
    start() {
      explain.start();
    },
    stop() {
      explain.stop();
    },
    getState() {
      explain.getState();
    },
    enable() {
      explain.enable("LV")
    },
    disable() {
      explain.disable("LV")
    },
    call() {
      //explain.callModelFunction("AA.test_function", [])
      explain.getModelProps("LV")
      explain.getPropValue("LV.u_vol")
    },
    add_to_watchlist() {
      explain.watchProps(["LV.pres", "RV.vol"])
      explain.watchPropsSlow(["AA.aboxy.to2"])
    }
  }
})
</script>
