<template>
  <q-page>
    <div class="q-pa-sm" style="background-color: black; min-height: 100vh;">
      <div class="row">
        <div class="col-3">
          <q-tabs v-model="tab_left" dense class="text-white" active-color="primary" indicator-color="primary"
            align="left" narrow-indicator outside-arrows @update:model-value="tabLeftChanged">
            <q-tab name="model_editor"><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon><q-tooltip>edit model
                parameters</q-tooltip>
            </q-tab>
            <q-tab name="circulatory_system"><q-icon name="fa-solid fa-heart" size="xs"></q-icon><q-tooltip>edit heart
                and circulatory system</q-tooltip>
            </q-tab>
            <q-tab name="respiratory_system"><q-icon name="fa-solid fa-lungs" size="xs"></q-icon><q-tooltip>edit
                respiratory system</q-tooltip>
            </q-tab>
          </q-tabs>

          <q-tab-panels v-model="tab_left" keep-alive style="background-color: black">
            <q-tab-panel name="model_editor">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 1.0
              }">
                <div v-for="(index) in no_of_modeleditor" :key="index">
                  <ModelEditor></ModelEditor>
                </div>

                <q-btn class="q-pb-xs q-pt-xs q-ma-sm" color="grey-9" size="xs" icon="fa-solid fa-plus"
                  @click="addModelEditor" style="font-size: 8px; width: 95%;"></q-btn>
                <q-btn v-if="no_of_modeleditor > 1" class="q-pb-xs q-pt-xs q-ma-sm" color="negative" size="xs"
                  icon="fa-solid fa-minus" @click="removeModelEditor" style="font-size: 8px; width: 95%;"></q-btn>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="circulatory_system">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">

                <NiceController :config="heart_controller"></NiceController>
                <NiceController :config="circulation_controller"></NiceController>
                <NiceController :config="pda_controller"></NiceController>
                <NiceController :config="resuscitation_controller"></NiceController>
                <NiceController :config="placenta_controller"></NiceController>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="respiratory_system">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <NiceController :config="respiration_controller"></NiceController>

              </q-scroll-area>
            </q-tab-panel>


          </q-tab-panels>
        </div>

        <div class="col-6">
          <q-tabs v-model="tab_center" dense class="text-white" active-color="primary" indicator-color="primary"
            align="center" narrow-indicator outside-arrows @update:model-value="tabCenterChanged">
            <q-tab name="time_chart">
              <q-icon name="fa-solid fa-chart-line" size="xs"></q-icon>
              <q-tooltip>time chart</q-tooltip>
            </q-tab>

            <q-tab name="xy_chart">
              <q-icon name="fa-solid fa-chart-area" size="xs"></q-icon>
              <q-tooltip>xy chart</q-tooltip>
            </q-tab>

            <q-tab name="heart">
              <q-icon name="fa-solid fa-heart" size="xs"></q-icon>
              <q-tooltip>cath lab</q-tooltip>
            </q-tab>

            <q-tab name="ventilator">
              <q-icon name="fa-solid fa-lungs" size="xs"></q-icon>
              <q-tooltip>mechanical ventilator</q-tooltip>
            </q-tab>

            <q-tab name="diagram">
              <q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon>
              <q-tooltip>diagram</q-tooltip>
            </q-tab>



          </q-tabs>
          <q-tab-panels v-model="tab_center" keep-alive style="background-color: black">
            <q-tab-panel name="time_chart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <TimeBasedChartComponent :alive="chart_alive"></TimeBasedChartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="ventilator">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <VentilatorComponent :alive="ventilator_alive"></VentilatorComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="heart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <HeartComponent :alive="heart_alive"></HeartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="xy_chart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <XYChartComponent :alive="xy_alive" title="XY Graph" :presets={}></XYChartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="diagram">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <DiagramComponent :alive="diagram_alive"></DiagramComponent>
              </q-scroll-area>
            </q-tab-panel>

          </q-tab-panels>


        </div>

        <div class="col-3">
          <q-tabs v-model="tab_right" dense class="text-white" active-color="primary" indicator-color="primary"
            align="left" narrow-indicator outside-arrows @update:model-value="tabRightChanged">
            <q-tab name="numerics">
              <q-icon name="fa-solid fa-keyboard" size="xs"></q-icon>
              <q-tooltip>numerical model parameters</q-tooltip>
            </q-tab>

            <q-tab name="heart">
              <q-icon name="fa-solid fa-heart" size="xs"></q-icon>
              <q-tooltip>heart monitoring</q-tooltip>
            </q-tab>

            <q-tab name="respiration">
              <q-icon name="fa-solid fa-lungs" size="xs"></q-icon>
              <q-tooltip>respiratory monitoring</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels v-model="tab_right" keep-alive style="background-color: black">
            <q-tab-panel name="numerics">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <div v-for="(numeric, index) in numerics" :key="index">
                  <NumericsComponent :title="numeric.title" :collapsed="numeric.collapsed"
                    :parameters="numeric.parameters"></NumericsComponent>
                </div>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="respiration">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <div v-for="(numeric, index) in respiration" :key="index">
                  <NumericsComponent :title="numeric.title" :collapsed="numeric.collapsed"
                    :parameters="numeric.parameters"></NumericsComponent>
                </div>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="heart">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <div v-for="(numeric, index) in heart" :key="index">
                  <NumericsComponent :title="numeric.title" :collapsed="numeric.collapsed"
                    :parameters="numeric.parameters"></NumericsComponent>
                </div>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import NumericsComponent from "src/components/NumericsComponent.vue";
import ModelEditor from "src/components/ModelEditorComponent.vue"
import TimeBasedChartComponent from 'src/components/TimeBasedChartComponent.vue';
import VentilatorComponent from 'src/components/VentilatorComponent.vue';
import XYChartComponent from 'src/components/XYChartComponent.vue';
import RespiratorySystemComponent from 'src/components/RespiratorySystemComponent.vue';
import HeartComponent from 'src/components/HeartComponent.vue';
import ShuntSystemComponent from 'src/components/ShuntSystemComponent.vue'
import DiagramComponent from 'src/components/DiagramComponent.vue';
import NiceController from 'src/components/NiceController.vue';

import { explain } from 'src/boot/explain';

export default defineComponent({
  name: 'MainPage',
  setup() { },
  components: {
    NumericsComponent,
    ModelEditor,
    TimeBasedChartComponent,
    VentilatorComponent,
    XYChartComponent,
    RespiratorySystemComponent,
    HeartComponent,
    ShuntSystemComponent,
    DiagramComponent,
    NiceController
  },
  data() {
    return {
      tab_left: "circulatory_system",
      tab_center: "diagram",
      tab_right: "numerics",
      no_of_modeleditor: 1,
      chart_alive: true,
      ventilator_alive: true,
      heart_alive: false,
      xy_alive: true,
      diagram_alive: true,
      screen_offset: 135.0,
      screen_height: 100.0,
      respiration: {
        vitals_numerics: {
          title: "VITALS",
          collapsed: false,
          parameters: [
            { label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"] },
            { label: "Abp AA", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AA.pres_max", "AA.pres_min"] },
            { label: "Abp AD", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AD.pres_max", "AD.pres_min"] },
            { label: "Resp rate", unit: "/min", factor: 1.0, rounding: 0, props: ["Breathing.resp_rate"] },
            { label: "SpO2(pre)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_pre"] },
            { label: "SpO2(post)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_post"] },
            { label: "SpO2(ven)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_ven"] }

          ]
        },
        lab_numerics: {
          title: "LABS",
          collapsed: true,
          parameters: [
            { label: "pH", unit: "", factor: 1.0, rounding: 2, props: ["Blood.ph"] },
            { label: "pO2", unit: "kPa", factor: 0.1333, rounding: 1, props: ["Blood.po2"] },
            { label: "pCO2", unit: "kPa", factor: 0.1333, rounding: 1, props: ["Blood.pco2"] },
            { label: "HCO3", unit: "mmol/l", factor: 1.0, rounding: 0, props: ["Blood.hco3"] },
            { label: "BE", unit: "mmol/l", factor: 1.0, rounding: 1, props: ["Blood.be"] },
            { label: "SO2", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2"] },
          ]
        },
        vent_numerics: {
          title: "VENTILATOR",
          collapsed: true,
          parameters: [
            { label: "Pip", unit: "cmh2o", factor: 1.0, rounding: 0, props: ["Ventilator.pip_cmh2o"] },
            { label: "Peep", unit: "cmh2o", factor: 1.0, rounding: 0, props: ["Ventilator.peep_cmh2o"] },
            { label: "Freq", unit: "/min", factor: 1.0, rounding: 0, props: ["Ventilator.vent_rate"] },
            { label: "Tv", unit: "ml", factor: 1000.0, rounding: 1, props: ["Ventilator.exp_tidal_volume"] },
            { label: "Mv", unit: "ml/min", factor: 1000.0, rounding: 0, props: ["Ventilator.minute_volume"] },
            { label: "Comp", unit: "ml/cmh2o", factor: 1.0, rounding: 1, props: ["Ventilator.compliance"] },
            { label: "Res", unit: "ml/cmh2o", factor: 1.0, rounding: 1, props: ["Ventilator.resistance"] },
            { label: "Etco2", unit: "kPa", factor: 0.1333, rounding: 1, props: ["Ventilator.etco2"] },
            { label: "Tv_hfo", unit: "ml", factor: 1.0, rounding: 1, props: ["Ventilator.hfo_tv"] },
            { label: "Mv_hfo", unit: "ml/min", factor: 1.0, rounding: 0, props: ["Ventilator.hfo_mv"] },
            { label: "Dco2", unit: "ml^2/s", factor: 1.0, rounding: 1, props: ["Ventilator.hfo_dco2"] },
          ]
        }
      },
      numerics: {
        vitals_numerics: {
          title: "VITALS",
          collapsed: false,
          parameters: [
            { label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"], weight_based: false },
            { label: "Abp AA", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AA.pres_max", "AA.pres_min"], weight_based: false },
            { label: "Abp AD", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AD.pres_max", "AD.pres_min"], weight_based: false },
            { label: "Pap", unit: "mmHg", factor: 1.0, rounding: 0, props: ["PA.pres_max", "PA.pres_min"], weight_based: false },
            { label: "Cvp", unit: "mmHg", factor: 1.0, rounding: 0, props: ["RA.pres_mean"], weight_based: false },
            { label: "Resp rate", unit: "/min", factor: 1.0, rounding: 0, props: ["Breathing.resp_rate"], weight_based: false },
            { label: "SpO2(pre)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_pre"], weight_based: false },
            { label: "SpO2(post)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_post"], weight_based: false },
            { label: "SpO2(ven)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_ven"], weight_based: false }
          ]
        },
        heart_numerics: {
          title: "HEART",
          collapsed: false,
          parameters: [
            { label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"], weight_based: false },
            { label: "LVP", unit: "mmHg", factor: 1.0, rounding: 1, props: ["LV.pres_max", "LV.pres_min"], weight_based: false },
            { label: "LVV", unit: "ml/kg", factor: 1000.0, rounding: 1, props: ["LV.vol_max", "LV.vol_min"], weight_based: true },
            { label: "LV_SV", unit: "ml/kg", factor: 1000.0, rounding: 1, props: ["LV.vol_sv"], weight_based: true },
            { label: "RVP", unit: "mmHg", factor: 1.0, rounding: 1, props: ["RV.pres_max", "RV.pres_min"], weight_based: false },
            { label: "RVV", unit: "ml/kg", factor: 1000.0, rounding: 1, props: ["RV.vol_max", "RV.vol_min"], weight_based: true },
            { label: "RV_SV", unit: "ml/kg", factor: 1000.0, rounding: 1, props: ["RV.vol_sv"], weight_based: true },
          ]
        },
        circulation_numerics: {
          title: "CIRCULATION",
          collapsed: false,
          parameters: [
            { label: "LVO", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["LV_AA.flow_lmin_avg"], weight_based: true },
            { label: "RVO", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["RV_PA.flow_lmin_avg"], weight_based: true },
            { label: "fCOR", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["COR_RA.flow_lmin_avg"], weight_based: true },
            { label: "fSVC", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["SVC_RA.flow_lmin_avg"], weight_based: true },
            { label: "fIVC", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["IVCI_RA.flow_lmin_avg"], weight_based: true },
            { label: "fDAo", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["AAR_AD.flow_lmin_avg"], weight_based: true },
            { label: "fPda", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["DA_OUT.flow_lmin_avg"], weight_based: true },
            { label: "fBR", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["AA_BR.flow_lmin_avg"], weight_based: true },
            { label: "fPlacenta", unit: "ml/kg/min", factor: 1000.0, rounding: 1, props: ["UMB_VEN.flow_lmin_avg"], weight_based: true },

          ]
        },
        lab_numerics: {
          title: "LABS",
          collapsed: true,
          parameters: [
            { label: "pH", unit: "", factor: 1.0, rounding: 2, props: ["Blood.ph"], weight_based: false },
            { label: "pO2", unit: "kPa", factor: 0.1333, rounding: 1, props: ["Blood.po2"], weight_based: false },
            { label: "pCO2", unit: "kPa", factor: 0.1333, rounding: 1, props: ["Blood.pco2"], weight_based: false },
            { label: "HCO3", unit: "mmol/l", factor: 1.0, rounding: 0, props: ["Blood.hco3"], weight_based: false },
            { label: "BE", unit: "mmol/l", factor: 1.0, rounding: 1, props: ["Blood.be"], weight_based: false },
            { label: "SO2", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2"], weight_based: false },
          ]
        },
        resp_numerics: {
          title: "RESPIRATION",
          collapsed: true,
          parameters: [
            { label: "Resp rate", unit: "/min", factor: 1.0, rounding: 0, props: ["Breathing.resp_rate"], weight_based: false },
            { label: "Tv", unit: "ml/kg", factor: 1000.0, rounding: 1, props: ["Breathing.exp_tidal_volume"], weight_based: true },
            { label: "Mv", unit: "ml/kg/min", factor: 1000.0, rounding: 0, props: ["Breathing.minute_volume"], weight_based: true },
          ]
        },
        vent_numerics: {
          title: "VENTILATOR",
          collapsed: true,
          parameters: [
            { label: "Pip", unit: "cmh2o", factor: 1.0, rounding: 0, props: ["Ventilator.pip_cmh2o"], weight_based: false },
            { label: "Peep", unit: "cmh2o", factor: 1.0, rounding: 0, props: ["Ventilator.peep_cmh2o"], weight_based: false },
            { label: "Freq", unit: "/min", factor: 1.0, rounding: 0, props: ["Ventilator.vent_rate"], weight_based: false },
            { label: "Tv", unit: "ml/kg", factor: 1000.0, rounding: 1, props: ["Ventilator.exp_tidal_volume"], weight_based: true },
            { label: "Mv", unit: "ml/kg/min", factor: 1000.0, rounding: 0, props: ["Ventilator.minute_volume"], weight_based: true },
            { label: "Comp", unit: "ml/cmh2o", factor: 1.0, rounding: 1, props: ["Ventilator.compliance"], weight_based: false },
            { label: "Res", unit: "ml/cmh2o", factor: 1.0, rounding: 1, props: ["Ventilator.resistance"], weight_based: false },
            { label: "Etco2", unit: "kPa", factor: 0.1333, rounding: 1, props: ["Ventilator.etco2"], weight_based: false },
            { label: "Tv_hfo", unit: "ml/kg", factor: 1.0, rounding: 1, props: ["Ventilator.hfo_tv"], weight_based: true },
            { label: "Mv_hfo", unit: "ml/kg/min", factor: 1.0, rounding: 0, props: ["Ventilator.hfo_mv"], weight_based: true },
            { label: "dco2", unit: "ml^2/s", factor: 1.0, rounding: 1, props: ["Ventilator.hfo_dco2"], weight_based: false },
          ]
        }
      },
      heart: {
        vitals_numerics: {
          title: "VITALS",
          collapsed: false,
          parameters: [
            { label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"] },
            { label: "Abp", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AA.pres_max", "AA.pres_min"] },
            { label: "Resp rate", unit: "/min", factor: 1.0, rounding: 0, props: ["Breathing.resp_rate"] },
            { label: "SpO2(pre)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_pre"] },
            { label: "SpO2(post)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_post"] },
            { label: "SpO2(ven)", unit: "%", factor: 1.0, rounding: 0, props: ["Blood.so2_ven"] }

          ]
        },
        heart_numerics: {
          title: "HEART",
          collapsed: false,
          parameters: [
            { label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"] },
            { label: "LVO", unit: "ml/min", factor: 1000.0, rounding: 0, props: ["LV_AA.flow_lmin"] },
            { label: "RVO", unit: "ml/min", factor: 1000.0, rounding: 0, props: ["RV_PA.flow_lmin"] },
            { label: "COR", unit: "ml/min", factor: 1000.0, rounding: 1, props: ["COR_RA.flow_lmin"] },
            { label: "LVP", unit: "mmHg", factor: 1.0, rounding: 1, props: ["LV.pres_max", "LV.pres_min"] },
            { label: "LVV", unit: "ml", factor: 1000.0, rounding: 1, props: ["LV.vol_max", "LV.vol_min"] },
            { label: "LV_SV", unit: "ml", factor: 1000.0, rounding: 1, props: ["LV.vol_sv"] },
            { label: "RVP", unit: "mmHg", factor: 1.0, rounding: 1, props: ["RV.pres_max", "RV.pres_min"] },
            { label: "RVV", unit: "mL", factor: 1000.0, rounding: 1, props: ["RV.vol_max", "RV.vol_min"] },
            { label: "RV_SV", unit: "mL", factor: 1000.0, rounding: 1, props: ["RV.vol_sv"] },
          ]
        },
        circulation_numerics: {
          title: "CIRCULATION",
          collapsed: true,
          parameters: []
        }
      },
      circulation_controller: {
        title: "CIRCULATORY SYSTEM",
        enabled: false,
        categories: {
          circulation: {
            caption: "Circulation",
            enabled: true,
            advanced: false,
          },
        },
        items: {
          svr: {
            caption: "syst vasc resistance",
            category: "circulation",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Circulation",
            prop: "svr_change",
            type: "factor",
            caller: "function",
            function_name: "change_svr",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          svel: {
            caption: "syst vasc elastance",
            category: "circulation",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Circulation",
            prop: "systartcomp_change",
            type: "factor",
            caller: "function",
            function_name: "change_syst_arterial_elastance",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          pvr: {
            caption: "pulm vasc resistance",
            category: "circulation",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Circulation",
            prop: "pvr_change",
            type: "factor",
            caller: "function",
            function_name: "change_pvr",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          pvel: {
            caption: "pulm vasc elastance",
            category: "circulation",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Circulation",
            prop: "pulmartcomp_change",
            type: "factor",
            caller: "function",
            function_name: "change_pulm_arterial_elastance",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          ven_pool: {
            caption: "venous pool",
            category: "circulation",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Circulation",
            prop: "venpool_change",
            type: "factor",
            caller: "function",
            function_name: "change_venpool",
            min: -5.0,
            max: 5.0,
            step: 0.05
          },
        }
      },
      respiration_controller: {
        title: "RESPIRATORY SYSTEM",
        enabled: true,
        categories: {
          breathing: {
            caption: "Breathing",
            enabled: true,
            advanced: false,
          },
          thorax: {
            caption: "Thorax",
            enabled: true,
            advanced: false,
          },
          airways: {
            caption: "Airways",
            enabled: true,
            advanced: false,
          },
          lungs: {
            caption: "Lungs",
            enabled: true,
            advanced: false,
          }
        },
        items: {
          breathing_enabled: {
            caption: "spontaneous breathing",
            category: "breathing",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "Breathing",
            prop: "breathing_enabled",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          thorax_compliance: {
            caption: "thoracic compliance",
            category: "thorax",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Lungs",
            prop: "thorax_comp_change",
            type: "factor",
            caller: "function",
            function_name: "change_thorax_compliance",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          lung_compliance: {
            caption: "lung compliance",
            category: "lungs",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Lungs",
            prop: "lung_comp_change",
            type: "factor",
            caller: "function",
            function_name: "change_lung_compliance",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          dead_space: {
            caption: "dead space",
            category: "lungs",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Lungs",
            prop: "dead_space_change",
            type: "factor",
            caller: "function",
            function_name: "change_dead_space",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          uaw_resistance: {
            caption: "upper airway resistance",
            category: "airways",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Lungs",
            prop: "upper_aw_res_change",
            type: "factor",
            caller: "function",
            function_name: "change_upper_airway_resistance",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          law_resistance: {
            caption: "lower airway resistance",
            category: "airways",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Lungs",
            prop: "lower_aw_res_change",
            type: "factor",
            caller: "function",
            function_name: "change_lower_airway_resistance",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          ips: {
            caption: "intra-pulmonary shunt resistance",
            category: "lungs",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Shunts",
            prop: "ips_res_factor",
            type: "factor",
            caller: "direct",
            function_name: "",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          diff_o2: {
            caption: "diffusion capacity o2",
            category: "lungs",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: true,
            linked_caption: "diffusion capacity",
            linked_to: "diff_co2",
            type: "factor",
            caller: "function",
            function_name: "change_dif_o2",
            model: "Lungs",
            prop: "dif_o2_change",
            min: -100.0,
            max: 100.0,
            step: 1
          },
          diff_co2: {
            caption: "diffusion capacity co2",
            category: "lungs",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: false,
            linked_to: "",
            type: "factor",
            caller: "function",
            function_name: "change_dif_co2",
            model: "Lungs",
            prop: "dif_co2_change",
            min: -100.0,
            max: 100.0,
            step: 1
          },
        }

      },
      pda_controller: {
        title: "DUCTUS ARTERIOSUS",
        enabled: false,
        categories: {
          properties: {
            caption: "Properties",
            enabled: true,
            advanced: false,
          },
        },
        items: {
          da_diameter: {
            caption: "diameter",
            category: "properties",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mm",
            caller: "direct",
            function_name: "",
            model: "Shunts",
            prop: "da_diameter",
            min: 0.0,
            max: 5.0,
            step: 0.1
          },
          da_length: {
            caption: "length",
            category: "properties",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mm",
            caller: "direct",
            function_name: "",
            model: "Shunts",
            prop: "da_length",
            min: 0.1,
            max: 50.0,
            step: 0.1
          },
          da_el: {
            caption: "elastance (abs)",
            category: "properties",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mmHg/l",
            caller: "direct",
            function_name: "",
            model: "Shunts",
            prop: "da_el_base",
            min: 100.0,
            max: 120000.0,
            step: 10.0
          },
          da_in: {
            caption: "inflow resistance (abs)",
            category: "properties",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mmHg*s/l",
            caller: "direct",
            function_name: "",
            model: "Shunts",
            prop: "da_in_res",
            min: 20.0,
            max: 1000.0,
            step: 10.0
          },
        }
      },
      heart_controller: {
        title: "HEART CONTROLLER",
        enabled: false,
        categories: {
          function: {
            caption: "Function",
            enabled: true,
            advanced: false,
          },
          shunts: {
            caption: "Shunts",
            enabled: true,
            advanced: false,
          },
          aortic_valve: {
            caption: "Aortic valve",
            enabled: false,
            advanced: false,
          },
          pulm_valve: {
            caption: "Pulmonary valve",
            enabled: false,
            advanced: false,
          },
          mitral_valve: {
            caption: "Mitral valve",
            enabled: false,
            advanced: false,
          },
          tricuspid_valve: {
            caption: "Tricuspid valve",
            enabled: false,
            advanced: false,
          },
          pericardium: {
            caption: "Pericardium",
            enabled: false,
            advanced: false,
          }
        },
        items: {
          left_contractility: {
            caption: "left contractility",
            category: "function",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: true,
            linked_caption: "contractility L/R",
            linked_to: "right_contractility",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "LV",
            prop: "el_max_factor",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          right_contractility: {
            caption: "right contractility",
            category: "function",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: false,
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "RV",
            prop: "el_max_factor",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          left_relaxation: {
            caption: "left relaxation",
            category: "function",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: true,
            linked_caption: "relaxation L/R",
            linked_to: "right_relaxation",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "LV",
            prop: "el_min_factor",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          right_relaxation: {
            caption: "right relaxation",
            category: "function",
            enabled: true,
            advanced: false,
            linked: true,
            link_button: false,
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "RV",
            prop: "el_min_factor",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          av_noflow: {
            caption: "valve closed",
            category: "aortic_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "LV_AA",
            prop: "no_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          av_r_for: {
            caption: "forward resistance",
            category: "aortic_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "LV_AA",
            prop: "r_for_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          av_nobackflow: {
            caption: "no flow back flow",
            category: "aortic_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "LV_AA",
            prop: "no_back_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          av_r_back: {
            caption: "backward resistance",
            category: "aortic_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "LV_AA",
            prop: "r_back_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          pv_noflow: {
            caption: "valve closed",
            category: "pulm_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "RV_PA",
            prop: "no_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          pv_r_for: {
            caption: "forward resistance",
            category: "pulm_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "RV_PA",
            prop: "r_for_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          pv_nobackflow: {
            caption: "no flow back flow",
            category: "pulm_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "RV_PA",
            prop: "no_back_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          pv_r_back: {
            caption: "backward resistance",
            category: "pulm_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "RV_PA",
            prop: "r_back_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          mv_noflow: {
            caption: "valve closed",
            category: "mitral_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "LA_LV",
            prop: "no_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          mv_r_for: {
            caption: "forward resistance",
            category: "mitral_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "LA_LV",
            prop: "r_for_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          mv_nobackflow: {
            caption: "no flow back flow",
            category: "mitral_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "LA_LV",
            prop: "no_back_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          mv_r_back: {
            caption: "backward resistance",
            category: "mitral_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "LA_LV",
            prop: "r_back_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          tv_noflow: {
            caption: "valve closed",
            category: "tricuspid_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "RA_RV",
            prop: "no_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          tv_r_for: {
            caption: "forward resistance",
            category: "tricuspid_valve",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "RA_RV",
            prop: "r_for_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          tv_nobackflow: {
            caption: "no flow back flow",
            category: "tricuspid_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "RA_RV",
            prop: "no_back_flow",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          tv_r_back: {
            caption: "backward resistance",
            category: "tricuspid_valve",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "RA_RV",
            prop: "r_back_factor",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          fo: {
            caption: "foramen ovale",
            category: "shunts",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mm",
            caller: "direct",
            function_name: "",
            model: "Shunts",
            prop: "fo_diameter",
            min: 0.0,
            max: 5.0,
            step: 0.1
          },
          vsd: {
            caption: "ventricular septal defect",
            category: "shunts",
            enabled: true,
            advanced: true,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mm",
            caller: "direct",
            function_name: "",
            model: "Shunts",
            prop: "vsd_diameter",
            min: 0.0,
            max: 5.0,
            step: 0.1
          },
          pc_el: {
            caption: "pericardium elastance",
            category: "pericardium",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "factor",
            caller: "direct",
            function_name: "",
            model: "PC",
            prop: "el_base_factor",
            min: 0.0,
            max: 100.0,
            step: 0.05
          },
          pc_vol_extra: {
            caption: "pericardium volume",
            category: "pericardium",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "number",
            unit: "mL",
            caller: "direct",
            function_name: "",
            model: "PC",
            prop: "vol_extra",
            min: 0.0,
            max: 500.0,
            step: 5
          },
        }

      },
      resuscitation_controller: {
        title: "RESUSCITATION",
        enabled: false,
        categories: {
          hr: {
            caption: "Heartrate",
            enabled: true,
            advanced: false,
          },
          cpr: {
            caption: "Ventilation and compressions",
            enabled: true,
            advanced: false
          }
        },
        items: {
          hr_forced_toggle: {
            caption: "force heartrate",
            category: "hr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            type: "boolean",
            caller: "direct",
            function_name: "",
            model: "Resuscitation",
            prop: "forced_hr",
            min: 1.0,
            max: 1000.0,
            step: 1
          },
          hr_forced: {
            caption: "forced heartrate",
            category: "hr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "overriden_hr",
            type: "number",
            caller: "direct",
            function_name: "",
            min: 0,
            max: 300,
            step: 1
          },
          cpr_enabled: {
            caption: "cpr enabled",
            category: "cpr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "cpr_enabled",
            type: "boolean",
            caller: "function",
            function_name: "switch_cpr",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          chest_comp_cont: {
            caption: "continuous compressions",
            category: "cpr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "chest_comp_cont",
            type: "boolean",
            caller: "direct",
            function_name: "",
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          comp_pres: {
            caption: "compressions pressure",
            category: "cpr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "chest_comp_pres",
            type: "number",
            caller: "direct",
            function_name: "",
            min: 0,
            max: 300,
            step: 1
          },
          comp_freq: {
            caption: "compressions frequency",
            category: "cpr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "chest_comp_freq",
            type: "number",
            caller: "direct",
            function_name: "",
            min: 0,
            max: 300,
            step: 1
          },
          comp_no: {
            caption: "no of compressions",
            category: "cpr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "compressions",
            type: "number",
            caller: "direct",
            function_name: "",
            min: -1,
            max: 30,
            step: 1
          },
          vent_no: {
            caption: "no of ventilations",
            category: "cpr",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Resuscitation",
            prop: "ventilations",
            type: "number",
            caller: "direct",
            function_name: "",
            min: -1,
            max: 30,
            step: 1
          },
        }

      },
      ans_controller: {

      },
      placenta_controller: {
        title: "PLACENTA",
        enabled: false,
        categories: {
          properties: {
            caption: "Properties",
            enabled: true,
            advanced: false,
          }
        },
        items: {
          placenta_enabled: {
            caption: "placenta enabled",
            category: "properties",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Placenta",
            prop: "pl_circ_enabled",
            type: "boolean",
            caller: "function",
            function_name: "switch_placenta"
          },
          umb_art_res: {
            caption: "umbilical artery resistance",
            category: "properties",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Placenta",
            prop: "umb_art_res",
            type: "number",
            caller: "direct",
            function_name: "",
            min: 20,
            max: 50000,
            step: 10
          },
          umb_ven_res: {
            caption: "umbilical veins resistance",
            category: "properties",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Placenta",
            prop: "umb_ven_res",
            type: "number",
            caller: "direct",
            function_name: "",
            min: 20,
            max: 50000,
            step: 10
          },
          plf_el: {
            caption: "fetal placenta elastance",
            category: "properties",
            enabled: true,
            advanced: false,
            linked: false,
            link_button: false,
            linked_caption: "",
            linked_to: "",
            model: "Placenta",
            prop: "plf_el_base",
            type: "number",
            caller: "direct",
            function_name: "",
            min: 20,
            max: 50000,
            step: 10
          }

        }
      }

    }
  },
  methods: {

    tabLeftChanged(tabName) {
      console.log(tabName)
      explain.getModelState()
    },
    tabRightChanged() {
      explain.getModelState()
    },
    tabCenterChanged(tabName) {
      explain.getModelState()
      switch (tabName) {
        case "ventilator":
          this.ventilator_alive = true
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "heart":
          this.ventilator_alive = false
          this.heart_alive = true
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "time_chart":
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = true
          this.xy_alive = false
          this.diagram_alive = false
          break;
        case "xy_chart":
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = true
          this.diagram_alive = false
          break;
        case "diagram":
          this.ventilator_alive = false
          this.heart_alive = false
          this.chart_alive = false
          this.xy_alive = false
          this.diagram_alive = true
          break;


      }
    },
    addModelEditor() {
      this.no_of_modeleditor += 1
      explain.getModelState()
    },
    removeModelEditor() {
      if (this.no_of_modeleditor > 1) {
        this.no_of_modeleditor -= 1
      }
    },
    updateWatchlist() {
      Object.keys(this.numerics).forEach(numeric => {
        this.numerics[numeric].parameters.forEach((p) => {
          explain.watchModelPropsSlow([...p.props])
        })
      })
      Object.keys(this.respiration).forEach(numeric => {
        this.numerics[numeric].parameters.forEach((p) => {
          explain.watchModelPropsSlow([...p.props])
        })
      })
      Object.keys(this.heart).forEach(numeric => {
        this.numerics[numeric].parameters.forEach((p) => {
          explain.watchModelPropsSlow([...p.props])
        })
      })
    },
  },
  beforeUnmount() {
    this.$bus.off("reset", this.updateWatchlist)
  },
  mounted() {
    // set the dark theme
    this.$q.dark.set(true);

    // get the screen height
    let h = this.$q.screen.height - this.screen_offset;
    this.screen_height = "height: " + h + "px; background: black";

    // make sure the modelengine watches everything which is visible on the main screen.
    this.updateWatchlist()

    // calculate 1 second of model
    explain.calculate(1);

    // get the model state
    explain.getModelState()

    this.$bus.on("reset", this.updateWatchlist)

  }
})
</script>
