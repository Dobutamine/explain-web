<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div
        class="row text-overline justify-center"
        @click="collapsed = !collapsed"
      >
        {{ title }}
      </div>
      <div v-if="!collapsed">
        <!-- edit model part -->
        <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
         
        </q-card>
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  
  export default {
    setup() {
      return {};
    },
    data() {
      return {
        title: "RESPIRATION",
        collapsed: false,
        isEnabled: true,

        timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
        changeInTime: 5,
        state_changed: false,
        collaps_icon: "fa-solid fa-chevron-up",
        fileContent: "",
      };
    },
    methods: {
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
  