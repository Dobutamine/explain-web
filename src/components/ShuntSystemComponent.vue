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
        <div class="col text-center">ductus arteriosus size</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lung_shunt" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeIntrapulmonaryShunt"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">foramen ovale size</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lung_shunt" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeIntrapulmonaryShunt"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">ventricular septal defect size</div>
      </div>
      <div class="row text-overline justify-center">
        <q-slider v-model="lung_shunt" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeIntrapulmonaryShunt"/>
      </div>

      <div class="row text-overline justify-center">
        <div class="col text-center">intra-pulmonary shunting</div>
      </div>
      <div class="row text-overline justify-center q-mb-sm">
        <q-slider v-model="lung_shunt" :step="0.1" :min="-10" :max="10" snap :markers="10" dense thumb-color="teal" color="transparent" class="q-ml-sm q-mr-sm col" @update:model-value="changeIntrapulmonaryShunt"/>
      </div>

    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";


export default {
  data() {
    return {
      title: "SHUNTS",
      isEnabled: true,
      thorax_compliance: 0,
      lungs_compliance: 0,
      upper_airway_resistance: 0,
      lower_airway_resistance: 0,
      diffusion_coefficient: 0,
      dead_space: 0,
      lung_shunt: 0,
      atelectasis: 0

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
    changeAtelectasis() {
      let factor = parseFloat(this.translateSliderToValue(this.atelectasis))
      explain.callModelFunction("Lungs.change_atelactasis", [factor])
    },
    changeIntrapulmonaryShunt() {
      let factor = parseFloat(this.translateSliderToValue(this.lung_shunt))
      explain.callModelFunction("Lungs.change_lung_shunt", [1 / factor])
    },
    changeDeadSpace() {
      let factor = parseFloat(this.translateSliderToValue(this.dead_space))
      explain.callModelFunction("Lungs.change_dead_space", [factor])
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
      if (explain.modelState.models) {
        this.thorax_compliance = this.translateValueToSlider(explain.modelState.models['Lungs'].thorax_comp_change)
        this.lungs_compliance = this.translateValueToSlider(explain.modelState.models['Lungs'].lung_comp_change)
        this.upper_airway_resistance = this.translateValueToSlider(explain.modelState.models['Lungs'].upper_aw_res_change)
        this.lower_airway_resistance = this.translateValueToSlider(explain.modelState.models['Lungs'].lower_aw_res_change)
        this.dead_space = this.translateValueToSlider(explain.modelState.models['Lungs'].dead_space_change)
        this.lung_shunt = this.translateValueToSlider(1.0 / explain.modelState.models['Lungs'].lung_shunt_change)
        this.atelectasis = this.translateValueToSlider(explain.modelState.models['Lungs'].atelectasis_change)
      }
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
