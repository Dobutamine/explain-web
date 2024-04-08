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
              heart contractility L/R ({{ leftHeartContractility_display_factor }}/{{
                rightHeartContractility_display_factor }})
              <q-btn @click="linkContractility" class="q-ml-sm" :color="contractilityLinkedColor" dense size="xs"
                icon="fa-solid fa-link"></q-btn>
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decLeftHeartContractility" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="leftHeartContractility" :step="0.1" :min="-10" :max="10"
              snap :markers="10" dense thumb-color="teal" color="transparent" @change="changeLeftHeartContractility" />
            <q-btn @click="incLeftHeartContractility" class="q-ma-sm col" dense size="xs" color="grey-10"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
          <div v-if="!contractilityLinked" class="row text-overline justify-center">
            <q-btn @click="decRightHeartContractility" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="rightHeartContractility" :step="0.1" :min="-10" :max="10"
              snap :markers="10" dense thumb-color="teal" color="transparent" @change="changeRightHeartContractility" />
            <q-btn @click="incRightHeartContractility" class="q-ma-sm col" dense size="xs" color="grey-10"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>

        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">

              heart relaxation L/R ({{ leftHeartRelaxation_display_factor }}/{{
                rightHeartRelaxation_display_factor }})
              <q-btn @click="linkRelaxation" class="q-ml-sm" :color="relaxationLinkedColor" dense size="xs"
                icon="fa-solid fa-link" </q-btn>
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decLeftHeartRelaxation" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="leftHeartRelaxation" :step="0.1" :min="-10" :max="10" snap
              :markers="10" dense thumb-color="teal" color="transparent" @change="changeLeftHeartRelaxation" />
            <q-btn @click="incLeftHeartRelaxation" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
          <div v-if="!relaxationLinked" class="row text-overline justify-center">
            <q-btn @click="decRightHeartRelaxation" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="rightHeartRelaxation" :step="0.1" :min="-10" :max="10" snap
              :markers="10" dense thumb-color="teal" color="transparent" @change="changeRightHeartRelaxation" />
            <q-btn @click="incRightHeartRelaxation" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
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
              syst vasc resistance ({{ this.svr_display_factor }})
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decSvr" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="svr" :step="0.1" :min="-10" :max="10" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changeSvr" />
            <q-btn @click="incSvr" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div v-if="circAdvanced">
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              syst vasc elastance ({{ this.svel_display_factor }})
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decSvel" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="svel" :step="0.1" :min="-10" :max="10" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changeSvel" />
            <q-btn @click="incSvel" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              pulm vasc resistance ({{ this.pvr_display_factor }})
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decPvr" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="pvr" :step="0.1" :min="-10" :max="10" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changePvr" />
            <q-btn @click="incPvr" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div v-if="circAdvanced">
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              pulm vasc elastance ({{ this.pvel_display_factor }})
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decPvel" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="pvel" :step="0.1" :min="-10" :max="10" snap :markers="10"
              dense thumb-color="teal" color="transparent" @change="changePvel" />
            <q-btn @click="incPvel" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              venous pooling ({{ this.venpool_display_factor }})
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
              ductus arteriosus ({{ this.da.toFixed(1) }})
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decDa" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="da" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeDa" />
            <q-btn @click="incDa" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div>
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              foramen ovale ({{ this.fo.toFixed(1) }})
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decFo" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="fo" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeFo" />
            <q-btn @click="incFo" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
          </div>
        </div>
        <div v-if="shuntsAdvanced">
          <div class="row text-overline justify-center">
            <q-badge class="q-pa-sm" color="grey-10">
              ventricular septal defect {{ this.vsd_diameter.toFixed(1) }}
            </q-badge>
          </div>
          <div class="row text-overline justify-center">
            <q-btn @click="decVsd" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-left"></q-btn>
            <q-slider class="q-ma-sm q-mr-sm col-8" v-model="vsd" :step="0.1" :min="0" :max="5" snap :markers="1" dense
              thumb-color="teal" color="transparent" @change="changeVsd" />
            <q-btn @click="incVsd" class="q-ma-sm col" color="grey-10" dense size="xs"
              icon="fa-solid fa-chevron-right"></q-btn>
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
      leftHeartContractility_display_factor: 1.0,
      rightHeartContractility: 0.0,
      rightHeartContractility_display_factor: 1.0,
      leftHeartRelaxation: 0.0,
      leftHeartRelaxation_display_factor: 1.0,
      rightHeartRelaxation: 0.0,
      rightHeartRelaxation_display_factor: 1.0,
      svr: 0.0,
      svr_display_factor: 1.0,
      svel: 0.0,
      svel_display_factor: 1.0,
      pvr: 0.0,
      pvr_display_factor: 1.0,
      pvel: 0.0,
      pvel_display_factor: 1.0,
      venPool: 0.0,
      venpool_display_factor: 1.0,
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
      this.leftHeartContractility_display_factor = factor.toFixed(2)
      explain.setPropValue("LV.el_max_factor", factor)
      explain.setPropValue("LA.el_max_factor", factor)
      if (this.contractilityLinked) {
        this.rightHeartContractility = this.leftHeartContractility
        this.rightHeartContractility_display_factor = factor.toFixed(2)
        explain.setPropValue("RV.el_max_factor", factor)
        explain.setPropValue("RA.el_max_factor", factor)
      }
    },
    incLeftHeartContractility() {
      this.leftHeartContractility += 0.05
      if (this.leftHeartContractility > 10) {
        this.leftHeartContractility = 10
      }
      this.changeLeftHeartContractility()
    },
    decLeftHeartContractility() {
      this.leftHeartContractility -= 0.05
      if (this.leftHeartContractility < -10) {
        this.leftHeartContractility = -10
      }
      this.changeLeftHeartContractility()
    },
    changeRightHeartContractility() {
      let factor = parseFloat(this.translateSliderToValue(this.rightHeartContractility))
      this.rightHeartContractility_display_factor = factor.toFixed(2)
      explain.setPropValue("RV.el_max_factor", factor)
      explain.setPropValue("RA.el_max_factor", factor)
      if (this.contractilityLinked) {
        this.leftHeartContractility = this.rightHeartContractility
        this.leftHeartContractility_display_factor = factor.toFixed(2)
        explain.setPropValue("LV.el_max_factor", factor)
        explain.setPropValue("LA.el_max_factor", factor)
      }
    },
    incRightHeartContractility() {
      this.rightHeartContractility += 0.05
      if (this.rightHeartContractility > 10) {
        this.rightHeartContractility = 10
      }
      this.changeRightHeartContractility()
    },
    decRightHeartContractility() {
      this.rightHeartContractility -= 0.05
      if (this.rightHeartContractility < -10) {
        this.rightHeartContractility = -10
      }
      this.changeRightHeartContractility()
    },
    changeLeftHeartRelaxation() {
      let factor = parseFloat(this.translateSliderToValue(this.leftHeartRelaxation))
      this.leftHeartRelaxation_display_factor = factor.toFixed(2)
      explain.setPropValue("LV.el_min_factor", factor)
      if (this.contractilityLinked) {
        this.rightHeartContractility = this.leftHeartRelaxation
        this.rightHeartRelaxation_display_factor = factor.toFixed(2)
        explain.setPropValue("RV.el_min_factor", factor)
      }
    },
    decLeftHeartRelaxation() {
      this.leftHeartRelaxation -= 0.05
      if (this.leftHeartRelaxation < -10) {
        this.leftHeartRelaxation = -10
      }
      this.changeLeftHeartRelaxation()
    },
    incLeftHeartRelaxation() {
      this.leftHeartRelaxation += 0.05
      if (this.leftHeartRelaxation > 10) {
        this.leftHeartRelaxation = 10
      }
      this.changeLeftHeartRelaxation()
    },
    changeRightHeartRelaxation() {
      let factor = parseFloat(this.translateSliderToValue(this.rightHeartRelaxation))
      this.rightHeartRelaxation_display_factor = factor.toFixed(2)
      explain.setPropValue("RV.el_min_factor", factor)
      if (this.contractilityLinked) {
        this.leftHeartContractility = this.rightHeartRelaxation
        this.leftHeartRelaxation_display_factor = factor.toFixed(2)
        explain.setPropValue("LV.el_min_factor", factor)
      }
    },
    incRightHeartRelaxation() {
      this.rightHeartRelaxation += 0.05
      if (this.rightHeartRelaxation > 10) {
        this.rightHeartRelaxation = 10
      }
      this.changeRightHeartRelaxation()
    },
    decRightHeartRelaxation() {
      this.rightHeartRelaxation -= 0.05
      if (this.rightHeartRelaxation < -10) {
        this.rightHeartRelaxation = -10
      }
      this.changeRightHeartRelaxation()
    },
    changeSvr() {
      let factor = parseFloat(this.translateSliderToValue(this.svr))
      this.svr_display_factor = factor.toFixed(2)
      explain.callModelFunction("Circulation.change_svr", [factor])
    },
    decSvr() {
      this.svr -= 0.05
      if (this.svr < -10) {
        this.svr = -10
      }
      this.changeSvr()
    },
    incSvr() {
      this.svr += 0.05
      if (this.svr > 10) {
        this.svr = 10
      }
      this.changeSvr()
    },
    changePvr() {
      let factor = parseFloat(this.translateSliderToValue(this.pvr))
      this.pvr_display_factor = factor.toFixed(2)
      explain.callModelFunction("Circulation.change_pvr", [factor])
    },
    decPvr() {
      this.pvr -= 0.05
      if (this.pvr < -10) {
        this.pvr = -10
      }
      this.changePvr()
    },
    incPvr() {
      this.pvr += 0.05
      if (this.pvr > 10) {
        this.pvr = 10
      }
      this.changePvr()
    },
    changeSvel() {
      let factor = parseFloat(this.translateSliderToValue(this.svel))
      this.svel_display_factor = factor.toFixed(2)
      explain.callModelFunction("Circulation.change_syst_arterial_elastance", [factor])
    },
    decSvel() {
      this.svel -= 0.05
      if (this.svel < -10) {
        this.svel = -10
      }
      this.changeSvel()
    },
    incSvel() {
      this.svel += 0.05
      if (this.svel > 10) {
        this.svel = 10
      }
      this.changeSvel()
    },
    changePvel() {
      let factor = parseFloat(this.translateSliderToValue(this.pvel))
      this.pvel_display_factor = factor.toFixed(2)
      explain.callModelFunction("Circulation.change_pulm_arterial_elastance", [factor])
    },
    decPvel() {
      this.pvel -= 0.05
      if (this.pvel < -10) {
        this.pvel = -10
      }
      this.changePvel()
    },
    incPvel() {
      this.pvel += 0.05
      if (this.pvel > 10) {
        this.pvel = 10
      }
      this.changePvel()
    },
    changeVenPool() {
      let factor = parseFloat(this.translateSliderToValue(this.venPool))
      this.venpool_display_factor = factor.toFixed(2)
      explain.callModelFunction("Circulation.change_venpool", [factor])
    },
    decVenPoolFactor() {
      this.venPool -= 0.05
      if (this.venPool < -5.0) {
        this.venPool = -5.0
      }
      this.changeVenPool()
    },
    incVenPoolFactor() {
      this.venPool += 0.05
      if (this.venPool > 5.0) {
        this.venPool = 5.0
      }
      this.changeVenPool()
    },
    changeDa() {
      explain.setPropValue("Shunts.da_diameter", this.da)

    },
    incDa() {
      this.da += 0.1
      if (this.da > 5) {
        this.da = 5
      }
      this.changeDa()
    },
    decDa() {
      this.da -= 0.1
      if (this.da < 0.0) {
        this.da = 0.0
      }
      this.changeDa()
    },
    changeFo() {
      explain.setPropValue("Shunts.fo_diameter", this.fo)
    },
    incFo() {
      this.fo += 0.1
      if (this.fo > 5.0) {
        this.fo = 5.0
      }
      this.changeFo()
    },
    decFo() {
      this.fo -= 0.1
      if (this.fo < 0.0) {
        this.fo = 0.0
      }
      this.changeFo()
    },
    changeVsd() {
      explain.setPropValue("Shunts.vsd_diameter", this.vsd)
    },
    incVsd() {
      this.vsd += 0.1
      if (this.vsd > 5.0) {
        this.vsd = 5.0
      }
      this.changeVsd()
    },
    decVsd() {
      this.vsd -= 0.1
      if (this.vsd < 0.0) {
        this.vsd = 0.0
      }
      this.changeVsd()
    },
    changeBt() {

    },
    changeSano() {

    },
    processModelState() {
      if (explain.modelState.models) {
        this.leftHeartContractility = this.translateValueToSlider(explain.modelState.models['LV'].el_max_factor)
        this.leftHeartContractility_display_factor = this.translateSliderToValue(this.leftHeartContractility).toFixed(2)
        this.leftHeartRelaxation = this.translateValueToSlider(explain.modelState.models['LV'].el_min_factor)
        this.leftHeartRelaxation_display_factor = this.translateSliderToValue(this.leftHeartRelaxation).toFixed(2)
        this.rightHeartContractility = this.translateValueToSlider(explain.modelState.models['RV'].el_max_factor)
        this.rightHeartContractility_display_factor = this.translateSliderToValue(this.rightHeartContractility).toFixed(2)
        this.rightHeartRelaxation = this.translateValueToSlider(explain.modelState.models['RV'].el_min_factor)
        this.rightHeartRelaxation_display_factor = this.translateSliderToValue(this.rightHeartRelaxation).toFixed(2)
        this.svr = this.translateValueToSlider(explain.modelState.models["Circulation"].svr_change)
        this.svr_display_factor = this.translateSliderToValue(this.svr).toFixed(2)
        this.pvr = this.translateValueToSlider(explain.modelState.models["Circulation"].pvr_change)
        this.pvr_display_factor = this.translateSliderToValue(this.pvr).toFixed(2)
        this.svel = this.translateValueToSlider(explain.modelState.models["Circulation"].systartcomp_change)
        this.svel_display_factor = this.translateSliderToValue(this.svel).toFixed(2)
        this.pvel = this.translateValueToSlider(explain.modelState.models["Circulation"].pulmartcomp_change)
        this.pvel_display_factor = this.translateSliderToValue(this.pvel).toFixed(2)
        this.venPool = this.translateValueToSlider(explain.modelState.models["Circulation"].venpool_change)
        this.venpool_display_factor = this.translateSliderToValue(this.venPool).toFixed(2)

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
