<template>
  <q-page>
    <div class="q-pa-sm">
      <div class="row">

        <div class="col-3">
          <q-tabs
            v-model="tab_left"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            outside-arrows
            @update:model-value="tabLeftChanged"
          >
            <q-tab
              name="model_editor"
              ><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon
              ><q-tooltip>edit model parameters</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels v-model="tab_right" keep-alive>
            <q-tab-panel name="numerics">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'grey-10',
                  width: '5px',
                  opacity: 0.5 }">
                  <ModelEditor :parameters=[]></ModelEditor>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <div class="col-6"></div>

        <div class="col-3">
          <q-tabs
            v-model="tab_right"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            outside-arrows
            @update:model-value="tabRightChanged"
          >
            <q-tab name="numerics">
              <q-icon name="fa-solid fa-keyboard" size="xs"></q-icon>
              <q-tooltip>numerical model parameters</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels v-model="tab_right" keep-alive>
            <q-tab-panel name="numerics">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'grey-10',
                  width: '5px',
                  opacity: 0.5 }">
                  <div v-for="(numeric, index) in numerics" :key="index">
                    <NumericsComponent
                      :title="numeric.title"
                      :collapsed="numeric.collapsed"
                      :parameters="numeric.parameters"
                    ></NumericsComponent>
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

import { explain } from 'src/boot/explain';

export default defineComponent({
  name: 'MainPage',
  setup(){},
  components: {
    NumericsComponent,
    ModelEditor
  },
  data() {
    return {
      tab_left: "model_editor",
      tab_right: "numerics",
      screen_offset: 10.0,
      screen_height: 100.0,
      numerics: {
        vitals_numerics: {
          title: "VITALS",
          collapsed: true,
          parameters: [
            {label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"]},
            {label: "ABP", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AA.pres_max", "AA.pres_min"]}
          ]
        },
        heart_numerics: {
          title: "HEART",
          collapsed: true,
          parameters: [
            {label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"]},
            {label: "LVO", unit: "ml/min", factor: 1000.0, rounding: 0, props: ["LV_AA.flow_lmin"]},
            {label: "LVP", unit: "ml", factor: 1.0, rounding: 1, props: ["LV.pres_max", "LV.pres_min"]},
            {label: "LVV", unit: "mmHg", factor: 1000.0, rounding: 0, props: ["LV.vol_max", "LV.vol_min"]},
            {label: "LV_SV", unit: "ml", factor: 1000.0, rounding: 1, props: ["LV.vol_sv"]},
            {label: "RVO", unit: "ml/min", factor: 1000.0, rounding: 0, props: ["RV_PA.flow_lmin"]},
            {label: "RVP", unit: "ml", factor: 1.0, rounding: 1, props: ["RV.pres_max", "RV.pres_min"]},
            {label: "RVV", unit: "mmHg", factor: 1000.0, rounding: 0, props: ["RV.vol_max", "RV.vol_min"]},
            {label: "RV_SV", unit: "ml", factor: 1000.0, rounding: 1, props: ["RV.vol_sv"]},
          ]
        },
        circulation_numerics: {
          title: "CIRCULATION",
          collapsed: true,
          parameters: []
        },
        resp_numerics: {
          title: "RESPIRATION",
          collapsed: true,
          parameters: []
        },
        lab_numerics: {
          title: "LABS",
          collapsed: true,
          parameters: []
        }
      }

    }
  },
  methods: {
    tabLeftChanged() {},
    tabRightChanged() {},
    updateWatchlist() {
      Object.keys(this.numerics).forEach(numeric => {
        this.numerics[numeric].parameters.forEach((p) => {
          explain.watchModelPropsSlow([...p.props])
        })
      })
    },
  },
  beforeUnmount() {},
  mounted() {
    // set the dark theme
    this.$q.dark.set(true);

    // get the screen height
    let h = this.$q.screen.height  - this.screen_offset;
    this.screen_height = "height: " + h + "px";

    // make sure the modelengine watches everything which is visible on the main screen.
    this.updateWatchlist()

    // do a small model test run of 5 seconds
    explain.calculate(5)
  }
})
</script>
