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
      explain.calculate(5);
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
      explain.setSubModelPropValue({
      prop: "LV.u_vol",
      t: 0.001,
      at: 0.0,
      it: 4.0,
      type: "number",
      ct: "abs",
    })
    },
    disable() {
      explain.setSubModelPropValue({
      prop: "LV.u_vol",
      t: 0.002,
      at: 0.0,
      it: 4.0,
      type: "number",
      ct: "abs",
    })
    },
    call() {
      explain.call("AA.volume_out", [10.0])
    },
    add_to_watchlist() {
      explain.watchProps(["LV.pres", "RV.vol"])
      explain.watchPropsSlow(["AA.aboxy.to2"])
    }
  }
})
</script>
