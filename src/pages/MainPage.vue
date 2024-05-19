<template>
  <q-page>
    <div class="q-pa-sm" style="background-color: black; min-height: 100vh;">
      <div class="row">
        <div class="col-3">
          <q-tabs v-model="tab_left" dense class="text-white" active-color="primary" indicator-color="primary"
            align="left" narrow-indicator outside-arrows @update:model-value="tabLeftChanged">
            <q-tab name="model_editor"><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon><q-tooltip>edit model
                components</q-tooltip>
            </q-tab>
            <q-tab name="circulatory_system"><q-icon name="fa-solid fa-heart" size="xs"></q-icon><q-tooltip>edit heart
                and circulatory system</q-tooltip>
            </q-tab>
            <q-tab name="respiratory_system"><q-icon name="fa-solid fa-lungs" size="xs"></q-icon><q-tooltip>edit
                respiratory system</q-tooltip>
            </q-tab>
            <q-tab name="brain"><q-icon name="fa-solid fa-brain" size="xs"></q-icon><q-tooltip>edit
                nervous system</q-tooltip>
            </q-tab>
            <q-tab name="other_systems"><q-icon name="fa-solid fa-bars" size="xs"></q-icon><q-tooltip>edit
                other systems</q-tooltip>
            </q-tab>
            <q-tab name="scaling"><q-icon name="fa-solid fa-weight-scale" size="xs"></q-icon><q-tooltip>global moddel
                scaling</q-tooltip>
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

                <div v-for="item in config.enabled_controllers.circulation">
                  <NiceController :config="config.controllers[item]"></NiceController>
                </div>

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

                <div v-for="item in config.enabled_controllers.respiration">
                  <NiceController :config="config.controllers[item]"></NiceController>
                </div>

              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="brain">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <div v-for="item in config.enabled_controllers.brain">
                  <NiceController :config="config.controllers[item]"></NiceController>
                </div>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="other_systems">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <div v-for="item in config.enabled_controllers.others">
                  <NiceController :config="config.controllers[item]"></NiceController>
                </div>

              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="scaling">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <NiceController :config="config.controllers.scaler_controller"></NiceController>
              </q-scroll-area>
            </q-tab-panel>

          </q-tab-panels>
        </div>

        <div class="col-6">
          <q-tabs v-model="tab_center" dense class="text-white" active-color="primary" indicator-color="primary"
            align="center" narrow-indicator outside-arrows @update:model-value="tabCenterChanged">

            <q-tab name="diagram">
              <q-icon name="fa-solid fa-home" size="xs"></q-icon>
              <q-tooltip>diagram</q-tooltip>
            </q-tab>

            <q-tab name="heart">
              <q-icon name="fa-solid fa-heart" size="xs"></q-icon>
              <q-tooltip>cath lab</q-tooltip>
            </q-tab>

            <q-tab name="ventilator">
              <q-icon name="fa-solid fa-lungs" size="xs"></q-icon>
              <q-tooltip>mechanical ventilator</q-tooltip>
            </q-tab>


            <q-tab name="time_chart">
              <q-icon name="fa-solid fa-chart-line" size="xs"></q-icon>
              <q-tooltip>time chart</q-tooltip>
            </q-tab>

            <q-tab name="xy_chart">
              <q-icon name="fa-solid fa-chart-area" size="xs"></q-icon>
              <q-tooltip>xy chart</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels v-model="tab_center" keep-alive style="background-color: black">

            <q-tab-panel name="diagram">
              <q-scroll-area class="q-pa-xs" dark :style="screen_height" :vertical-bar-style="{
                right: '5px',
                borderRadius: '5px',
                background: 'black',
                width: '5px',
                opacity: 0.5
              }">
                <DiagramComponent :alive="diagram_alive" :global_scale="config.diagram_scale"
                  :global_speed="config.diagram_speed">
                </DiagramComponent>
              </q-scroll-area>
            </q-tab-panel>

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
          </q-tab-panels>
        </div>

        <div class="col-3">
          <q-tabs v-model="tab_right" dense class="text-white" active-color="primary" indicator-color="primary"
            align="left" narrow-indicator outside-arrows @update:model-value="tabRightChanged">
            <q-tab name="numerics">
              <q-icon name="fa-solid fa-desktop" size="xs"></q-icon>
              <q-tooltip>monitoring</q-tooltip>
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
                <BigNumbersComponent></BigNumbersComponent>
                <div v-for="(numeric, index) in config.numerics" :key="index">
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
import { useConfigStore } from 'src/stores/config';
import NumericsComponent from "src/components/NumericsComponent.vue";
import ModelEditor from "src/components/ModelEditorComponent.vue"
import TimeBasedChartComponent from 'src/components/TimeBasedChartComponent.vue';
import VentilatorComponent from 'src/components/VentilatorComponent.vue';
import XYChartComponent from 'src/components/XYChartComponent.vue';
import HeartComponent from 'src/components/HeartComponent.vue';
import DiagramComponent from 'src/components/DiagramComponent.vue';
import NiceController from 'src/components/NiceController.vue';
import BigNumbersComponent from 'src/components/BigNumbersComponent.vue';

import { explain } from 'src/boot/explain';

export default defineComponent({
  name: 'MainPage',
  setup() {
    const config = useConfigStore();

    return {
      config
    }
  },
  components: {
    NumericsComponent,
    BigNumbersComponent,
    ModelEditor,
    TimeBasedChartComponent,
    VentilatorComponent,
    XYChartComponent,
    HeartComponent,
    DiagramComponent,
    NiceController
  },
  data() {
    return {
      tab_left: "other_systems",
      tab_center: "diagram",
      tab_right: "numerics",
      no_of_modeleditor: 1,
      chart_alive: true,
      ventilator_alive: true,
      heart_alive: false,
      xy_alive: true,
      diagram_alive: true,
      screen_offset: 135.0,
      screen_height: 100.0
    }
  },
  methods: {

    tabLeftChanged(tabName) {
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
      explain.watchModelPropsSlow(["Heart.heart_rate", "Blood.so2_pre", "Blood.so2_post", "AD.pres_max", "AD.pres_min", "AD.pres_mean", "Breathing.resp_rate", "Ventilator.vent_rate"])

      Object.keys(this.config.numerics).forEach(numeric => {
        this.config.numerics[numeric].parameters.forEach((p) => {
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
