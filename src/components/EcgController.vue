<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div
        class="row text-overline justify-center"
        @click="collapsed = !collapsed"
      >
        {{ title }}
      </div>
      <div v-if="!collapsed">
        <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
          <ExplainSlider sliderType="absolute" title="pq time" :range="[0, 1000]" unit="ms" :step="1" @value-updated="onPqTimeChanged"></ExplainSlider>
        </q-card> 
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  import ExplainSlider from "./ExplainSlider.vue";
  
  export default {
    setup() {
      return {};
    },
    components: {
      ExplainSlider
    },
    data() {
      return {
        title: "ECG",
        pqTime: 40,
        collapsed: true,
        isEnabled: true,
        collaps_icon: "fa-solid fa-chevron-up",
      };
    },
    methods: {
      onPqTimeChanged(newValue) {
        this.pqTime = newValue
      },
      collapsEditor() {
        if (this.isEnabled) {
          this.isEnabled = false;
          this.collaps_icon = "fa-solid fa-chevron-up";
        } else {
          this.isEnabled = true;
          this.collaps_icon = "fa-solid fa-chevron-down";
        }
      },
    },
    beforeUnmount() {
      this.state_changed = false;
    },
    mounted() {
    },
  };
  </script>
  
  <style></style>
  