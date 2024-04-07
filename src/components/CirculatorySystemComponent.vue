<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div v-if="isEnabled">
      <div class="q-ml-md q-md-sm q-mt-xs row gutter justify-center text-secondary">
        <div class="q-mt-sm text-secondary">
          Heart
        </div>
        <q-btn @click="toggleHeart" class="q-ma-sm q-ml-xs q-mt-xs" :color="heartEnabledColor" dense size="xs"
          :icon="heartEnabledIcon"></q-btn>
        <q-btn @click="showAdvancedHeart" class="q-ma-sm" :color="heartAdvancedColor" dense size="xs"
          icon="fa-solid fa-ellipsis"></q-btn>
      </div>
      <div v-if="heartEnabled">
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              heart contractility L/R
              <q-btn @click="linkContractility" class="q-ml-sm" :color="contractilityLinkedColor" dense size="xs"
                icon="fa-solid fa-link"></q-btn>
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="leftHeartContractility" :step="0.1" :min="-10" :max="10"
              snap :markers="10" dense thumb-color="teal" color="transparent" @change="changeLeftHeartContractility" />
            <q-btn class="q-ma-sm col" dense size="xs" color="grey-10" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
          <div v-if="!contractilityLinked" class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="rightHeartContractility" :step="0.1" :min="-10" :max="10"
              snap :markers="10" dense thumb-color="teal" color="transparent" @change="changeRightHeartContractility" />
            <q-btn class="q-ma-sm col" dense size="xs" color="grey-10" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>

        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">

              heart relaxation L/R
              <q-btn @click="linkRelaxation" class="q-ml-sm" :color="relaxationLinkedColor" dense size="xs"
                icon="fa-solid fa-link" </q-btn>
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="leftHeartRelaxation" :step="0.1" :min="-10" :max="10" snap
              :markers="10" dense thumb-color="teal" color="transparent" @change="changeLeftHeartRelaxation" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
          <div v-if="!relaxationLinked" class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="rightHeartRelaxation" :step="0.1" :min="-10" :max="10" snap
              :markers="10" dense thumb-color="teal" color="transparent" @change="changeRightHeartRelaxation" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
      </div>

      <div class="q-mt-xs row gutter  justify-center text-secondary">
        <div class="q-mt-sm text-secondary">
          Circulation
        </div>

        <q-btn @click="toggleCirc" class="q-ma-sm q-ml-xs q-mt-xs" :color="circEnabledColor" dense size="xs"
          :icon="circEnabledIcon"></q-btn>
        <q-btn @click="showAdvancedCirc" class="q-ma-sm" :color="circAdvancedColor" dense size="xs"
          icon="fa-solid fa-ellipsis"></q-btn>
      </div>
      <div v-if="circEnabled">
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              systemic vascular resistance
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="svr" :step="0.1" :min="-10" :max="10" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changeSvr" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              pulmonary vascular resistance
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="pvr" :step="0.1" :min="-10" :max="10" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changePvr" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              venous pooling
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decVenPoolFactor" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="venPool" :step="0.01" :min="-5" :max="5" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changeVenPool" />
            <q-btn @click="incVenPoolFactor" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
      </div>

      <div class="q-mt-xs row gutter  justify-center text-secondary">
        <div class="q-mt-sm text-secondary">
          Shunts
        </div>

        <q-btn @click="toggleShunts" class="q-ma-sm q-ml-xs q-mt-xs" :color="shuntsEnabledColor" dense size="xs"
          :icon="shuntsEnabledIcon"></q-btn>
        <q-btn @click="showAdvancedShunts" class="q-ma-sm" :color="shuntsAdvancedColor" dense size="xs"
          icon="fa-solid fa-ellipsis"></q-btn>
      </div>
      <div v-if="shuntsEnabled">
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              ductus arteriosus
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="da" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeDa" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              foramen ovale
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="fo" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeFo" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div v-if="shuntsAdvanced">
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              ventricular septal defect
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="vsd" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeVsd" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div v-if="shuntsAdvanced">
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              modified BTT shunt
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="mdbtt" :step="0.1" :min="0" :max="5" snap :markers="1"
              dense thumb-color="teal" color="transparent" @change="changeBt" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div v-if="shuntsAdvanced">
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              sano shunt
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="sano" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeSano" />
            <q-btn class="q-ma-sm col" color="grey-10" dense size="xs" icon="fa-solid fa-chevron-right"></q-btn>
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
      advanced: false,
      isEnabled: true,
      heartEnabled: true,
      heartEnabledIcon: "fa-solid fa-chevron-down",
      heartEnabledColor: "transparent",
      heartAdvanced: false,
      heartAdvancedColor: "transparent",
      circEnabled: true,
      circEnabledIcon: "fa-solid fa-chevron-down",
      circEnabledColor: "transparent",
      circAdvanced: false,
      circAdvancedColor: "transparent",
      shuntsEnabled: true,
      shuntsEnabledIcon: "fa-solid fa-chevron-down",
      shuntsEnabledColor: "transparent",
      shuntsAdvanced: false,
      shuntsAdvancedColor: "transparent",
      contractilityLinked: true,
      contractilityLinkedColor: "black",
      relaxationLinked: true,
      relaxationLinkedColor: "black",
      leftHeartContractility: 0.0,
      rightHeartContractility: 0.0,
      leftHeartRelaxation: 0.0,
      rightHeartRelaxation: 0.0,
      svr: 0.0,
      pvr: 0.0,
      venPool: 0.0,
      da: 0.0,
      fo: 0.0,
      vsd: 0.0,
      mdbtt: 0.0,
      sano: 0.0
    };
  },
  methods: {
    toggleHeart() {
      if (this.heartEnabled) {
        this.heartEnabled = false
        this.heartEnabledIcon = "fa-solid fa-chevron-right"
      } else {
        this.heartEnabled = true
        this.heartEnabledIcon = "fa-solid fa-chevron-down"
      }
    },
    showAdvancedHeart() {
      if (this.heartAdvanced) {
        this.heartAdvanced = false
        this.heartAdvancedColor = "transparent"
      } else {
        this.heartAdvanced = true
        this.heartAdvancedColor = "negative"
      }
    },
    linkContractility() {
      if (this.contractilityLinked) {
        this.contractilityLinked = false
        this.contractilityLinkedColor = "negative"

      } else {
        this.contractilityLinked = true
        this.contractilityLinkedColor = "black"
      }
    },
    linkRelaxation() {
      if (this.relaxationLinked) {
        this.relaxationLinked = false
        this.relaxationLinkedColor = "negative"

      } else {
        this.relaxationLinked = true
        this.relaxationLinkedColor = "black"
      }
    },
    toggleCirc() {
      if (this.circEnabled) {
        this.circEnabled = false
        this.circEnabledIcon = "fa-solid fa-chevron-right"
      } else {
        this.circEnabled = true
        this.circEnabledIcon = "fa-solid fa-chevron-down"
      }
    },
    showAdvancedCirc() {
      if (this.circAdvanced) {
        this.circAdvanced = false
        this.circAdvancedColor = "transparent"
      } else {
        this.circAdvanced = true
        this.circAdvancedColor = "negative"
      }
    },
    toggleShunts() {
      if (this.shuntsEnabled) {
        this.shuntsEnabled = false
        this.shuntsEnabledIcon = "fa-solid fa-chevron-right"
      } else {
        this.shuntsEnabled = true
        this.shuntsEnabledIcon = "fa-solid fa-chevron-down"
      }

    },
    showAdvancedShunts() {
      if (this.shuntsAdvanced) {
        this.shuntsAdvanced = false
        this.shuntsAdvancedColor = "transparent"
      } else {
        this.shuntsAdvanced = true
        this.shuntsAdvancedColor = "negative"
      }
    },
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
    changeLeftHeartContractility() {
      let factor = parseFloat(this.translateSliderToValue(this.leftHeartContractility))
      explain.setPropValue("LV.el_max_factor", factor)
      if (this.contractilityLinked) {
        this.rightHeartContractility = this.leftHeartContractility
        explain.setPropValue("RV.el_max_factor", factor)
      }

    },
    changeRightHeartContractility() {
      let factor = parseFloat(this.translateSliderToValue(this.rightHeartContractility))
      explain.setPropValue("RV.el_max_factor", factor)
      if (this.contractilityLinked) {
        this.leftHeartContractility = this.rightHeartContractility
        explain.setPropValue("LV.el_max_factor", factor)
      }
    },
    changeLeftHeartRelaxation() {
      let factor = parseFloat(this.translateSliderToValue(this.leftHeartContractility))
      explain.setPropValue("LV.el_min_factor", factor)
      if (this.contractilityLinked) {
        this.rightHeartContractility = this.leftHeartContractility
        explain.setPropValue("RV.el_min_factor", factor)
      }
    },
    changeRightHeartRelaxation() {
      let factor = parseFloat(this.translateSliderToValue(this.rightHeartContractility))
      explain.setPropValue("RV.el_min_factor", factor)
      if (this.contractilityLinked) {
        this.leftHeartContractility = this.rightHeartContractility
        explain.setPropValue("LV.el_min_factor", factor)
      }
    },
    changeSvr() {
      let factor = parseFloat(this.translateSliderToValue(this.svr))
      explain.callModelFunction("Circulation.change_svr", [factor])
      explain.callModelFunction("Circulation.change_syst_arterial_elastance", [factor])
    },
    changePvr() {
      let factor = parseFloat(this.translateSliderToValue(this.pvr))
      explain.callModelFunction("Circulation.change_pvr", [factor])
    },
    changeVenPool() {
      let factor = parseFloat(this.translateSliderToValue(this.venPool))
      explain.callModelFunction("Circulation.change_venpool", [factor])
    },
    decVenPoolFactor() {
      this.venPool -= 0.01
      if (this.venPool < -5.0) {
        this.venPool = -5.0
      }
    },
    incVenPoolFactor() {
      this.venPool += 0.01
      if (this.venPool > 5.0) {
        this.venPool = 5.0
      }
    },
    changeDa() {

    },
    changeFo() {

    },
    changeVsd() {

    },
    changeBt() {

    },
    changeSano() {

    },
    processModelState() {
      if (explain.modelState.models) {
        this.leftHeartContractility = this.translateValueToSlider(explain.modelState.models['LV'].el_max_factor)
        this.leftHeartRelaxation = this.translateValueToSlider(explain.modelState.models['LV'].el_min_factor)
        this.rightHeartContractility = this.translateValueToSlider(explain.modelState.models['RV'].el_max_factor)
        this.rightHeartRelaxation = this.translateValueToSlider(explain.modelState.models['RV'].el_min_factor)
        this.svr = this.translateValueToSlider(explain.modelState.models["Circulation"].svr_change)
        this.pvr = this.translateValueToSlider(explain.modelState.models["Circulation"].pvr_change)
        this.venPool = this.translateValueToSlider(explain.modelState.models["Circulation"].venpool_change)
        this.da = explain.modelState.models["Shunts"].da_diameter
        this.fo = explain.modelState.models["Shunts"].fo_diameter
        this.vsd = explain.modelState.models["Shunts"].vsd_diameter
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
