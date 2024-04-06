<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div v-if="isEnabled">

      <div class="q-ml-md q-md-sm q-mt-xs row gutter text-overline justify-center text-red">
        TWEAKER
      </div>
      <div>
        <div>
          <div class="row text-overline justify-center">
            <q-btn @click="shutDownControl" class="q-ma-sm">SHUT DOWN SHUNTS</q-btn>
          </div>
          <div class="row text-overline justify-center">
            <q-input label="PA el_base" v-model="pa_el" :step="0.001" color="blue" hide-hint filled dense
              @change="updatePulmSystem" stack-label type="number" style="font-size: 14px" class="q-ma-sm col" squared>
            </q-input>
          </div>
          <div class="row text-overline justify-center">
            <q-input label="PA_LL and PA_RL res" v-model="pa_ll" :step="0.001" color="blue" hide-hint filled dense
              @change="updatePulmResistanceSystem" stack-label type="number" style="font-size: 14px" class="q-ma-sm col"
              squared>
            </q-input>
          </div>

        </div>

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
      isEnabled: true,
      pa_el: 0.0,
      pa_ll: 0.0,
      pa_rl: 0.0,
      pv_la: 0.0,

      aa_el: 0.0,
      aar_el: 0.0,
      ad_el: 0.0,

      aa_br: 0.0,
      aa_rub: 0.0,

      ad_int: 0.0,
      ad_kid: 0.0,
      ad_ls: 0.0,
      ad_rlb: 0.0,
      el_min_ra: 0.0,
      el_max_ra: 0.0,
      el_min_rv: 0.0,
      el_max_rv: 0.0,
      el_min_la: 0.0,
      el_max_la: 0.0,
      el_min_lv: 0.0,
      el_max_lv: 0.0,



      leftHeartContractility: 0.0,
      leftHeartRelaxation: 0.0,
      rightHeartContractility: 0.0,
      rightHeartRelaxation: 0.0,

    };
  },
  methods: {
    updatePulmSystem() {
      console.log('updating pulmonary system')
      explain.setPropValue("PA.el_base", parseFloat(this.pa_el), 1.0)


    },
    updatePulmResistanceSystem() {
      console.log('updating pulmonary system')
      explain.setPropValue("PA_LL.r_for", parseFloat(this.pa_ll), 1.0)
      explain.setPropValue("PA_LL.r_back", parseFloat(this.pa_ll), 1.0)
      explain.setPropValue("PA_RL.r_for", parseFloat(this.pa_ll), 1.0)
      explain.setPropValue("PA_RL.r_back", parseFloat(this.pa_ll), 1.0)

    },
    changePropState(f, v) {
      console.log(f, v)
    },
    shutDownControl() {
      explain.setPropValue("Metabolism.vo2_factor", 0.0, 0.0)
      explain.setPropValue("Ans.is_enabled", false, 0.0)
      explain.setPropValue("Mob.is_enabled", false, 0.0)
      explain.setPropValue("GASEX_LL.is_enabled", false, 0.0)
      explain.setPropValue("GASEX_RL.is_enabled", false, 0.0)
      explain.setPropValue("Breathing.breathing_enabled", false, 0.0)
      explain.setPropValue("Heart.heart_rate_override", true, 0.0)
      explain.setPropValue("Heart.heart_rate_forced", 110.0, 0.0)
    },
    shutDownMetabolism() { },
    shutDownBreathing() { },

    processModelState() {
      try {
        this.pa_el = explain.modelState.models['PA'].el_base
        this.pa_ll = explain.modelState.models['PA_LL'].r_for
        this.pa_rl = explain.modelState.models['PA_RL'].r_for
        this.pv_la = explain.modelState.models['PV_LA'].r_for


        this.aa_el = explain.modelState.models['AA'].el_base
        this.aar_el = explain.modelState.models['AAR'].el_base
        this.ad_el = explain.modelState.models['AD'].el_base

        this.el_max_la = explain.modelState.models['LA'].el_max
        this.el_min_la = explain.modelState.models['LA'].el_min
        this.el_max_lv = explain.modelState.models['LV'].el_max
        this.el_min_lv = explain.modelState.models['LV'].el_min

        this.el_max_ra = explain.modelState.models['RA'].el_max
        this.el_min_ra = explain.modelState.models['RA'].el_min
        this.el_max_rv = explain.modelState.models['RV'].el_max
        this.el_min_rv = explain.modelState.models['RV'].el_min
      } catch { }




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
