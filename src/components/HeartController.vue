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
          <ExplainSlider title="left heart contractility" sliderType="factor" :range="[-1, 1]" :step="0.01" unit="x" @value-updated="onContLeftValueUpdated"></ExplainSlider>
          <ExplainSlider title="left heart relaxation" sliderType="factor" :range="[-1, 1]" :step="0.01" @value-updated="onRelaxLeftValueUpdated"></ExplainSlider>
          <ExplainSlider title="right heart contractility" sliderType="factor" :range="[-1, 1]" :step="0.01" unit="x" @value-updated="onContRightValueUpdated"></ExplainSlider>
          <ExplainSlider title="right heart relaxation" sliderType="factor" :range="[-1, 1]" :step="0.01" @value-updated="onRelaxRightValueUpdated"></ExplainSlider>

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
        title: "HEART",
        collapsed: true,
        isEnabled: true,
        contFactorLeft: 1.0,
        contFactorRight: 1.0,
        relaxFactorLeft: 1.0,
        relaxFactorRight: 1.0,
        timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
        changeInTime: 5,
        state_changed: false,
        collaps_icon: "fa-solid fa-chevron-up",
        fileContent: "",
      };
    },
    methods: {
      onRelaxLeftValueUpdated(newValue) {
        this.relaxFactorLeft = newValue
        explain.callModelFunction("Circulation.change_left_heart_relaxation", [this.relaxFactorLeft])
      },
      onContLeftValueUpdated(newValue) {
        this.contFactorLeft = newValue
        explain.callModelFunction("Circulation.change_left_heart_contractility", [this.contFactorLeft])
      },
      onRelaxRightValueUpdated(newValue) {
        this.relaxFactorRight = newValue
        explain.callModelFunction("Circulation.change_right_heart_relaxation", [this.relaxFactorRight])
      },
      onContRightValueUpdated(newValue) {
        this.contFactorRight = newValue
        explain.callModelFunction("Circulation.change_right_heart_contractility", [this.contFactorRight])
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
