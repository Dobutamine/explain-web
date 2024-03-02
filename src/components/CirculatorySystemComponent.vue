<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="q-mt-es row gutter text-overline justify-center text-red"
      @click="isEnabled = !isEnabled"
    >
      {{ title }}
    </div>
    <div v-if="isEnabled">
      <div class="row text-overline justify-center">
        <div class="col text-center">Total blood volume = {{ upper_airway_resistance * 10.0 }}</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="upper_airway_resistance" :min="-10" :max="10" :step="0.1"  color="teal" class="q-ml-sm q-mr-sm col" @update:model-value="changeUpperAirwayResistance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">Systemic vascular resistance = {{ thorax_compliance * 10.0 }}</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="thorax_compliance" :min="-10" :max="10" :step="0.1" color="teal" class="q-ml-sm q-mr-sm col" @update:model-value="changeThoraxCompliance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">Pulmonary vascular resistance = {{ lungs_compliance * 10.0 }}</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lungs_compliance" :min="-10" :max="10" :step="0.1"  color="teal" class="q-ml-sm q-mr-sm col" @update:model-value="changeLungCompliance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">Venous pool size = {{ lungs_compliance * 10.0 }}</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lungs_compliance" :min="-10" :max="10" :step="0.1"  color="teal" class="q-ml-sm q-mr-sm col" @update:model-value="changeLungCompliance"/>
      </div>





    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";


export default {
  data() {
    return {
      title: "CIRCULATORY SYSTEM",
      isEnabled: false,
      thorax_compliance: 0,
      lungs_compliance: 0,
      upper_airway_resistance: 0,
      lower_airway_resistance: 0,
      diffusion_coefficient: 0,

    };
  },
  methods: {
    translateSliderToValue(v) {
      if (v == 0) {
        return 1;
      }

      if (v < 0) {
        return -(1 / (v - 1));
      }

      if (v < 1) {
        return 1 + v
      }

      return 1 + v
    },
    translateValueToSlider(v) {
      if (v < 1) {
        return (-(1 / v) + 1.0)
      }

      if (v > 1) {
        return (v - 1)
      }

      return 0;
    },
    changeLungCompliance() {
      let factor = parseFloat(this.translateSliderToValue(this.lungs_compliance))
      explain.callModelFunction("Lungs.change_lung_compliance", [factor])
    },
    changeThoraxCompliance() {
      let factor = parseFloat(this.translateSliderToValue(this.thorax_compliance))
      explain.callModelFunction("Lungs.change_thorax_compliance", [factor])
    },
    changeUpperAirwayResistance() {
      let factor = this.translateSliderToValue(this.upper_airway_resistance)
      explain.callModelFunction("Lungs.change_upper_airway_resistance", [factor])
    },
    changeLowerAirwayResistance() {
      let factor = this.translateSliderToValue(this.lower_airway_resistance)
      explain.callModelFunction("Lungs.change_lower_airway_resistance", [factor])
    },
    changeDiffusionCoefficient() {
      let factor = this.translateSliderToValue(this.diffusion_coefficient)
      explain.callModelFunction("Lungs.change_dif_o2", [factor])
      explain.callModelFunction("Lungs.change_dif_co2", [factor])
    },
    processModelState() {

    },
  },
  beforeUnmount() {

  },
  mounted() {
    this.$bus.on("state", this.processModelState)

  },
};
</script>

<style></style>
