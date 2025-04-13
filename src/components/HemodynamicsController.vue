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
          <ExplainSlider title="systemic vascular resistance" sliderType="factor" :range="[-1, 1]" :step="0.01" unit="x" @value-updated="onSvrValueUpdated"></ExplainSlider>
          <ExplainSlider title="systemic vascular elastance" sliderType="factor" :range="[-1, 1]" :step="0.01" unit="x" @value-updated="onSveValueUpdated"></ExplainSlider>

          <ExplainSlider title="pulmonary vascular resistance" sliderType="factor" :range="[-1, 1]" :step="0.01" unit="x" @value-updated="onPvrValueUpdated"></ExplainSlider>
          <ExplainSlider title="pulmonary vascular elastance" sliderType="factor" :range="[-1, 1]" :step="0.01" unit="x" @value-updated="onPveValueUpdated"></ExplainSlider>
          <ExplainSlider title="venous pool" slider-type="factor" :range="[-1, 1]" unit="x" :step="0.01" @value-updated="onVenPoolValueUpdated"></ExplainSlider>
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
        title: "CIRCULATION",
        collapsed: true,
        isEnabled: true,
        svrFactor: 1.0,
        pvrFactor: 1.0,
        sveFactor: 1.0,
        pveFactor: 1.0,
        venPoolFactor: 1.0,
        ductusSize: 0.0,
        collaps_icon: "fa-solid fa-chevron-up",
      };
    },
    methods: {
      onVenPoolValueUpdated(newVal) {
        this.venPoolFactor = newVal
      },
      onSvrValueUpdated(newVal) {
        this.svrFactor = newVal
        explain.callModelFunction("Circulation.change_syst_art_resistance", [this.svrFactor])
      },
      onSveValueUpdated(newVal) {
        this.sveFactor = newVal
        explain.callModelFunction("Circulation.change_syst_art_elastance", [this.sveFactor])
      },
      onPvrValueUpdated(newVal) {
        this.pvrFactor = newVal
        explain.callModelFunction("Circulation.change_pulm_art_resistance", [this.pvrFactor])
      },
      onPveValueUpdated(newVal) {
        this.pveFactor = newVal
        explain.callModelFunction("Circulation.change_pulm_art_elastance", [this.pveFactor])
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
    beforeUnmount() {},
    mounted() {},
  };
  </script>

  <style></style>
