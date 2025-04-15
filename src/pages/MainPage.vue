<template>
  <q-page>
    <div class="q-pa-sm" style="background-color: black; min-height: 100vh">
      <div class="row">
        <div class="col-3">
          <q-tabs
            v-model="tab_left"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            narrow-indicator
            outside-arrows
            @update:model-value="tabLeftChanged"
          >
            <q-tab name="model_editor"
              ><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon
              ><q-tooltip>edit model components</q-tooltip>
            </q-tab>

            <q-tab name="hemodynamics_editor"
              ><q-icon name="fa-solid fa-heart" size="xs"></q-icon
              ><q-tooltip>edit hemodynamic system</q-tooltip>
            </q-tab>

            <q-tab name="respiration_editor"
              ><q-icon name="fa-solid fa-lungs" size="xs"></q-icon
              ><q-tooltip>edit respiratory system</q-tooltip>
            </q-tab>

            <q-tab name="ans_editor"
              ><q-icon name="fa-solid fa-brain" size="xs"></q-icon
              ><q-tooltip>edit autonomic nervous system</q-tooltip>
            </q-tab>

            <q-tab name="diagram_editor"
              ><q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon
              ><q-tooltip>edit diagram components</q-tooltip>
            </q-tab>

            <q-tab name="scaler"
              ><q-icon name="fa-solid fa-diagram-project" size="xs"></q-icon
              ><q-tooltip>scaler</q-tooltip>
            </q-tab>
          </q-tabs>

          <q-tab-panels
            v-model="tab_left"
            keep-alive
            style="background-color: black"
          >
            <q-tab-panel name="model_editor">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 1.0,
                }"
              >
                <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
                  <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                    "
                  >
                    <q-file
                      class="q-ma-sm"
                      dark
                      dense
                      flat
                      stack-label
                      label="Select a model definition file"
                      filled
                      :display-value="selectedModelFile"
                      style="
                        width: 100%;
                        justify-content: center;
                        font-size: 12px;
                      "
                      @update:model-value="handleModelDefinitionFileAdded"
                    >
                      <template v-slot:append>
                        <q-icon name="fa-solid fa-floppy-disk" />
                      </template>
                    </q-file>
                  </div>
                  <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                    "
                  >

                  <q-btn
                  class="q-ma-sm"
                  color="negative"
                  size="sm"
                  dense
                  @click="downloadPython"
                  ><q-tooltip> download model as python file </q-tooltip> SAVE MODEL (PYTHON)</q-btn>
                  <q-btn
                  class="q-ma-sm"
                  color="negative"
                  size="sm"
                  dense
                  @click="downloadJson"
                  ><q-tooltip> download model as json file </q-tooltip> SAVE MODEL (JSON)</q-btn>
                  </div>
                </q-card>
                <div v-for="index in no_of_modeleditor" :key="index">
                  <ModelEditor></ModelEditor>
                </div>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>

          <q-tab-panels
            v-model="tab_left"
            keep-alive
            style="background-color: black"
          >

            <q-tab-panel name="hemodynamics_editor">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 1.0,
                }"
              >
                <EcgController></EcgController>
                <HeartController></HeartController>
                <HemodynamicsController></HemodynamicsController>
                <ShuntsController></ShuntsController>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>

          <q-tab-panels
            v-model="tab_left"
            keep-alive
            style="background-color: black"
          >

            <q-tab-panel name="respiration_editor">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 1.0,
                }"
              >
                <RespirationController></RespirationController>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>

          <q-tab-panels
            v-model="tab_left"
            keep-alive
            style="background-color: black"
          >

            <q-tab-panel name="ans_editor">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 1.0,
                }"
              >
                <AnsController></AnsController>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>


          <q-tab-panels
            v-model="tab_left"
            keep-alive
            style="background-color: black"
          >

            <q-tab-panel name="diagram_editor">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 1.0,
                }"
              >
              <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
                <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                    "
                  >
                  <q-file
                    class="q-ma-sm"
                    dark
                    dense
                    flat
                    stack-label
                    label="Select a custom diagram file"
                    filled
                    :display-value="selectedDiagramFile"
                    style="
                      width: 300px;
                      justify-content: center;
                      font-size: 12px;
                    "
                    @update:model-value="handleDiagramAdded"
                  >
                    <template v-slot:append>
                      <q-icon name="fa-solid fa-floppy-disk" />
                    </template>
                  </q-file>
                </div>
                  <div
                    style="
                      display: flex;
                      justify-content: center;
                      align-items: center;
                    "
                  >

                  <q-btn
                  class="q-ma-sm"
                  color="negative"
                  size="sm"
                  dense
                  @click="downloadDiagram"
                  ><q-tooltip> download diagram file </q-tooltip> SAVE DIAGRAM</q-btn>
                  </div>
                </q-card>
                <DiagramEditorComponent></DiagramEditorComponent>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        
          <q-tab-panels
            v-model="tab_left"
            keep-alive
            style="background-color: black"
          >

            <q-tab-panel name="scaler">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 1.0,
                }"
              >
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <div class="col-6">
          <q-tabs
            v-model="tab_center"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            narrow-indicator
            outside-arrows
            @update:model-value="tabCenterChanged"
          >
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

          <q-tab-panels
            v-model="tab_center"
            keep-alive
            style="background-color: black"
          >
            <q-tab-panel name="diagram">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 0.5,
                }"
              >
                <DiagramComponent :alive="diagram_alive"> </DiagramComponent>

              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="time_chart">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 0.5,
                }"
              >
                <TimeBasedChartComponent
                  :alive="chart_alive"
                ></TimeBasedChartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="ventilator">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 0.5,
                }"
              >
                <VentilatorComponent
                  :alive="ventilator_alive"
                ></VentilatorComponent>
                <div class="q-pa-sm flex flex-center">
                  <NumericsComponent
                    title="VENTILATOR MEASUREMENTS"
                    :parameters="numerics_ventilator"
                  ></NumericsComponent>
                </div>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="heart">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 0.5,
                }"
              >
                <HeartComponent :alive="heart_alive"></HeartComponent>
              </q-scroll-area>
            </q-tab-panel>

            <q-tab-panel name="xy_chart">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 0.5,
                }"
              >
                <XYChartComponent
                  :alive="xy_alive"
                  title="XY Graph"
                  :presets="{}"
                ></XYChartComponent>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>



        </div>

        <div class="col-3">
          <q-tabs
            v-model="tab_right"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            narrow-indicator
            outside-arrows
            @update:model-value="tabRightChanged"
          >
            <q-tab name="numerics">
              <q-icon name="fa-solid fa-desktop" size="xs"></q-icon>
              <q-tooltip>monitoring</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels
            v-model="tab_right"
            keep-alive
            style="background-color: black"
          >
            <q-tab-panel name="numerics">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'black',
                  width: '5px',
                  opacity: 0.5,
                }"
              >
                <BigNumbersComponent></BigNumbersComponent>
                <NumericsComponent
                  title="HEART"
                  :collapsed="true"
                  :parameters="numerics_heart"
                ></NumericsComponent>
                <NumericsComponent
                  title="CIRCULATION"
                  :collapsed="true"
                  :parameters="numerics_circulation"
                ></NumericsComponent>
                <NumericsComponent
                  title="SHUNTS"
                  :collapsed="true"
                  :parameters="numerics_shunts"
                ></NumericsComponent>
                <NumericsComponent
                  title="BREATHING"
                  :collapsed="true"
                  :parameters="numerics_ventilation"
                ></NumericsComponent>
                <NumericsComponent
                  title="BLOODGAS"
                  :collapsed="true"
                  :parameters="numerics_bloodgas"
                ></NumericsComponent>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
            <ModelController class="custom-offset"> </ModelController>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useUserStore } from "src/stores/user";
import { useStateStore } from "src/stores/state";
import NumericsComponent from "src/components/NumericsComponent.vue";
import ModelEditor from "src/components/ModelEditorComponent.vue";
import TimeBasedChartComponent from "src/components/TimeBasedChartComponent.vue";
import VentilatorComponent from "src/components/VentilatorComponent.vue";
import XYChartComponent from "src/components/XYChartComponent.vue";
import HeartComponent from "src/components/HeartComponent.vue";
import DiagramComponent from "src/components/DiagramComponent.vue";
import ModelController from "src/components/ModelController.vue";
import NiceController from "src/components/NiceController.vue";
import BigNumbersComponent from "src/components/BigNumbersComponent.vue";
import DiagramEditorComponent from "src/components/DiagramEditor.vue";
import HemodynamicsController from "src/components/HemodynamicsController.vue";

import { explain } from "src/boot/explain";
import RespirationController from "src/components/RespirationController.vue";
import AnsController from "src/components/AnsController.vue";
import ShuntsController from "src/components/ShuntsController.vue";
import HeartController from "src/components/HeartController.vue";
import EcgController from "src/components/EcgController.vue";


export default defineComponent({
  name: "MainPage",
  setup() {
    const state = useStateStore();
    const user = useUserStore();

    return {
      state,
      user,
    };
  },
  components: {
    EcgController,
    HeartController,
    HemodynamicsController,
    RespirationController,
    AnsController,
    ShuntsController,
    NumericsComponent,
    BigNumbersComponent,
    ModelEditor,
    TimeBasedChartComponent,
    VentilatorComponent,
    XYChartComponent,
    HeartComponent,
    DiagramComponent,
    ModelController,
    NiceController,
    DiagramEditorComponent,
  },
  data() {
    return {
      tab_left: "hemodynamics_editor",
      tab_center: "diagram",
      tab_right: "numerics",
      no_of_modeleditor: 1,
      chart_alive: true,
      ventilator_alive: true,
      heart_alive: false,
      xy_alive: true,
      diagram_alive: true,
      screen_offset: 150.0,
      screen_height: 1000.0,
      serialData: null,
      port: null,
      reader: null,
      connected: false,
      selectedModelFile: "",
      selectedDiagramFile: "",
      numerics_heart: [
        {
          label: "LVV",
          unit: "ml/kg",
          weight_based: true,
          factor: 1.0,
          rounding: 1,
          props: ["Monitor.esv_lv", "Monitor.edv_lv"],
        },
        {
          label: "RVV",
          unit: "ml/kg",
          weight_based: true,
          factor: 1.0,
          rounding: 1,
          props: ["Monitor.esv_rv","Monitor.edv_rv"],
        },
        {
          label: "LVP",
          unit: "mmhg",
          weight_based: false,
          factor: 1.0,
          rounding: 1,
          props: ["Monitor.esp_lv", "Monitor.edp_lv"],
        },
        {
          label: "RVP",
          unit: "mmhg",
          weight_based: false,
          factor: 1.0,
          rounding: 1,
          props: ["Monitor.esp_rv", "Monitor.edp_rv"],
        },
        {
          label: "LVO",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 0,
          props: ["Monitor.lvo"],
        },
        {
          label: "RVO",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 0,
          props: ["Monitor.rvo"],
        },
      ],
      numerics_circulation: [
        {
          label: "LVO",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 0,
          props: ["Monitor.lvo"],
        },
        {
          label: "RVO",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 0,
          props: ["Monitor.rvo"],
        },
        {
          label: "fSVC",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.svc_flow"],
        },
        {
          label: "fIVC",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.ivc_flow"],
        },
        {
          label: "fCOR",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.cor_flow"],
        },
        {
          label: "fBR",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.brain_flow"],
        },
        {
          label: "fKID",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.kid_flow"],
        },
        {
          label: "Vol_total",
          unit: "ml/kg",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Circulation.total_blood_volume"],
        },
        {
          label: "Vol_syst",
          unit: "%",
          weight_based: false,
          factor: 100.0,
          rounding: 1,
          props: ["Circulation.total_blood_volume_syst"],
        },
        {
          label: "Vol_pulm",
          unit: "%",
          weight_based: false,
          factor: 100.0,
          rounding: 1,
          props: ["Circulation.total_blood_volume_pulm"],
        },
        {
          label: "Vol_heart",
          unit: "%",
          weight_based: false,
          factor: 100.0,
          rounding: 1,
          props: ["Circulation.total_blood_volume_heart"],
        },
      ],
      numerics_shunts: [
        {
          label: "fDA",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.da_flow"],
        },
        {
          label: "fFO",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.fo_flow"],
        },
        {
          label: "fVSD",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.vsd_flow"],
        },
        {
          label: "fIPS",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000.0,
          rounding: 1,
          props: ["Monitor.ips_flow"],
        },
      ],
      numerics_ventilation: [
        {
          label: "Resp rate",
          unit: "/min",
          weight_based: false,
          factor: 1,
          rounding: 0,
          props: ["Breathing.resp_rate"],
        },
        {
          label: "MV",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000,
          rounding: 0,
          props: ["Breathing.minute_volume"],
        },
        {
          label: "TVexp",
          unit: "ml/kg",
          weight_based: true,
          factor: 1000,
          rounding: 1,
          props: ["Breathing.exp_tidal_volume"],
        },
      ],
      numerics_ventilator: [
        {
          label: "MV",
          unit: "ml/kg/min",
          weight_based: true,
          factor: 1000,
          rounding: 0,
          props: ["Ventilator.minute_volume"],
        },
        {
          label: "TVexp",
          unit: "ml/kg",
          weight_based: true,
          factor: 1000,
          rounding: 1,
          props: ["Ventilator.exp_tidal_volume"],
        },
        {
          label: "C",
          unit: "ml/cmH2O",
          weight_based: false,
          factor: 1000,
          rounding: 1,
          props: ["Ventilator.compliance"],
        },
        {
          label: "R",
          unit: "cmH2O/l/s",
          weight_based: false,
          factor: 1,
          rounding: 1,
          props: ["Ventilator.resistance"],
        },
        {
          label: "etCO2",
          unit: "kPa",
          weight_based: false,
          factor: 0.133,
          rounding: 1,
          props: ["Ventilator.etco2"],
        },
      ],
      numerics_bloodgas: [
        {
          label: "pH",
          unit: "",
          weight_based: false,
          factor: 1.0,
          rounding: 2,
          props: ["AD.ph"],
        },
        {
          label: "pO2",
          unit: "kPa",
          weight_based: false,
          factor: 0.133322,
          rounding: 1,
          props: ["AD.po2"],
        },
        {
          label: "pCO2",
          unit: "kPa",
          weight_based: false,
          factor: 0.133322,
          rounding: 1,
          props: ["AD.pco2"],
        },
        {
          label: "HCO3-",
          unit: "mmol/l",
          weight_based: false,
          factor: 1.0,
          rounding: 0,
          props: ["AD.hco3"],
        },
        {
          label: "BE",
          unit: "mmol/l",
          weight_based: false,
          factor: 1.0,
          rounding: 1,
          props: ["AD.be"],
        },
      ],
    };
  },
  methods: {
    downloadDiagram() {
      this.state.saveDiagramToDisk();
    },
    downloadJson() {
      explain.download_model_state_json();
    },
    downloadPython() {
      explain.download_model_state_python();
    },
    handleDiagramAdded(file) {
      // Access the first file in the selected files
      this.selectedDiagramFile = file.name;
      if (file) {
        this.readDiagramFile(file);
      }
    },
    readDiagramFile(file) {
      const reader = new FileReader();
      // Define what happens when the file is successfully read
      reader.onload = (e) => {
        this.fileContent = e.target.result; // Stores the content of the file
        this.state.diagram_definition = JSON.parse(this.fileContent);
        this.$bus.emit("rebuild_diagram");
      };
      // Start reading the file as text or data URL based on your needs
      reader.readAsText(file); // Reads as text for JSON or .txt files
    },
    handleModelDefinitionFileAdded(file) {
      // stop the realtime model
      this.$bus.emit("ext_stop")
      // Access the first file in the selected files
      this.selectedModelFile = file.name;
      if (file) {
        this.readModelDefinitionFile(file);
      }
    },
    readModelDefinitionFile(file) {
      const reader = new FileReader();

      // switch the diagram view
      this.tab_center = "diagram"
      this.tabCenterChanged("diagram")

      // Define what happens when the file is successfully read
      reader.onload = (e) => {
        this.fileContent = e.target.result; // Stores the content of the file
        this.state.model_definition = JSON.parse(this.fileContent);
        let t = JSON.parse(this.fileContent);
        explain.build(t);
      };

      // Start reading the file as text or data URL based on your needs
      reader.readAsText(file); // Reads as text for JSON or .txt files
    },
    tabLeftChanged() {
      explain.getModelState();
    },
    tabRightChanged() {
      explain.getModelState();
    },
    tabCenterChanged(tabName) {
      explain.getModelState();
      switch (tabName) {
        case "ventilator":
          this.ventilator_alive = true;
          this.heart_alive = false;
          this.chart_alive = false;
          this.xy_alive = false;
          this.diagram_alive = false;
          break;
        case "heart":
          this.ventilator_alive = false;
          this.heart_alive = true;
          this.chart_alive = false;
          this.xy_alive = false;
          this.diagram_alive = false;
          break;
        case "time_chart":
          this.ventilator_alive = false;
          this.heart_alive = false;
          this.chart_alive = true;
          this.xy_alive = false;
          this.diagram_alive = false;
          break;
        case "xy_chart":
          this.ventilator_alive = false;
          this.heart_alive = false;
          this.chart_alive = false;
          this.xy_alive = true;
          this.diagram_alive = false;
          break;
        case "diagram":
          this.ventilator_alive = false;
          this.heart_alive = false;
          this.chart_alive = false;
          this.xy_alive = false;
          this.diagram_alive = true;
          break;
      }
    },
    updateWatchlist() {
      this.numerics_circulation.forEach((n) => {
        n.props.forEach((p) => {
          explain.watchModelPropsSlow([p]);
        });
      });
      this.numerics_shunts.forEach((n) => {
        n.props.forEach((p) => {
          explain.watchModelPropsSlow([p]);
        });
      });
      this.numerics_bloodgas.forEach((n) => {
        n.props.forEach((p) => {
          explain.watchModelPropsSlow([p]);
        });
      });
      this.numerics_ventilation.forEach((n) => {
        n.props.forEach((p) => {
          explain.watchModelPropsSlow([p]);
        });
      });
      this.numerics_ventilator.forEach((n) => {
        n.props.forEach((p) => {
          explain.watchModelPropsSlow([p]);
        });
      });
      this.numerics_heart.forEach((n) => {
        n.props.forEach((p) => {
          explain.watchModelPropsSlow([p]);
        });
      });
    },
  },
  beforeUnmount() {
    // remove the event handlers
    this.$bus.off("reset", this.updateWatchlist);
    this.$bus.off("model_ready", this.updateWatchlist);
  },
  mounted() {
    // set the dark theme
    this.$q.dark.set(true);

    // get the screen height
    let h = this.$q.screen.height - this.screen_offset;
    this.screen_height = "height: " + h + "px; background: black";

    // update the watchlist when the model is ready
    this.$bus.on("model_ready", this.updateWatchlist);

    // update the watchlist when the model resets
    this.$bus.on("reset", this.updateWatchlist);
  },
});
</script>
<style scoped>
.custom-offset {
  bottom: 30px; /* Adjust the offset as needed */
  position: fixed;
  width: 300px;
  left: 50%; /* Optional: centers the button horizontally */
  transform: translateX(-50%); /* Optional: ensures perfect centering */
}
</style>
