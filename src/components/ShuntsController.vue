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
          <ExplainSlider sliderType="absolute" title="foramen ovale size" :range="[0,5]" unit="mm" :initialValue="ofoSize" :step="0.1" @value-updated="onOfoSizeChanged"></ExplainSlider>
          <ExplainSlider sliderType="absolute" title="ductus arteriosus size" :range="[0,5]" unit="mm" :initialValue="pdaSize" :step="0.01" @value-updated="onPdaSizeChanged"></ExplainSlider>
          <ExplainSlider sliderType="absolute" title="ventricular septal size" :range="[0,10]" unit="mm" :initialValue="vsdSize" :step="0.1" @value-updated="onVsdSizeChanged"></ExplainSlider>
          <ExplainSlider sliderType="factor" title="intrapulmonary shunt resistance" :range="[-1,1]" unit="x" :initialValue="ipsFactor" :step="0.1" @value-updated="onIpsSizeChanged"></ExplainSlider>


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
        title: "SHUNTS",
        collapsed: true,
        isEnabled: true,
        pdaSize: 0.0,
        ofoSize: 0.0,
        vsdSize: 0.0,
        ipsFactor: 1.0,
        state_changed: false,
        collaps_icon: "fa-solid fa-chevron-up",
        fileContent: "",
      };
    },
    methods: {
      onPdaSizeChanged(newValue) {
        this.pdaSize = newValue;
        explain.callModelFunction("Shunts.set_ductus_arteriosus_properties", [this.pdaSize])
      },
      onOfoSizeChanged(newValue) {
        this.ofoSize = newValue;
        explain.callModelFunction("Shunts.set_foramen_ovale_properties", [this.ofoSize])
      },
      onVsdSizeChanged(newValue) {
        this.vsdSize = newValue;
        explain.callModelFunction("Shunts.set_ventricular_septal_defect_properties", [this.vsdSize])
      },
      onIpsSizeChanged(newValue) {
        this.ipsFactor = newValue;
        explain.callModelFunction("Respiration.change_intrapulmonary_shunting", [this.ipsFactor])
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
