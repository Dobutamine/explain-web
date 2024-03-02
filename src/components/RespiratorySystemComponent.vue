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
        <div class="col text-center">thoracic cage compliance</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="thorax_compliance" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeThoraxCompliance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">lung compliance</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lungs_compliance" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeLungCompliance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">upper airway resistance</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="upper_airway_resistance" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeUpperAirwayResistance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">lower airway resistance</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lower_airway_resistance" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeLowerAirwayResistance"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">diffusion coefficients</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="diffusion_coefficient" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeDiffusionCoefficient"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">ventilation perfusion mismatch</div>
      </div>
      <div class="row text-overline justify-center q-mb-sm">
        <q-slider v-model="diffusion_coefficient" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeDiffusionCoefficient"/>
      </div>

    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";


export default {
  data() {
    return {
      title: "RESPIRATORY SYSTEM",
      isEnabled: true,
      thorax_compliance: 0,
      lungs_compliance: 0,
      upper_airway_resistance: 0,
      lower_airway_resistance: 0,
      diffusion_coefficient: 0

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
      this.thorax_compliance = this.translateValueToSlider(explain.modelState.models['Lungs'].thorax_comp_change)
      this.lungs_compliance = this.translateValueToSlider(explain.modelState.models['Lungs'].lung_comp_change)
      this.upper_airway_resistance = this.translateValueToSlider(explain.modelState.models['Lungs'].upper_aw_res_change)
      this.lower_airway_resistance = this.translateValueToSlider(explain.modelState.models['Lungs'].lower_aw_res_change)
      this.diffusion_coefficient = this.translateValueToSlider(explain.modelState.models['Lungs'].dif_o2_change)
    },
  },
  beforeUnmount() {

  },
  mounted() {
    this.$bus.on("state", this.processModelState)
    explain.getModelState()

  },
};
</script>

<style></style>
