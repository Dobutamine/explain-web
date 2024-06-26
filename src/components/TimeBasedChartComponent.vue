<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>
    <div v-if="isEnabled" class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center q-gutter-xs row">
      <q-select label-color="red" class="q-pa-xs col" v-model="selectedModel1" square label="model1" hide-hint
        :options="modelNames" dense dark stack-label @update:model-value="selectModel1" />
      <q-select v-if="selectedModel1 !== ''" label-color="red" class="q-pa-xs col" v-model="selectedProp1" square
        label="prop1" hide-hint :options="prop1Names" dense dark stack-label @update:model-value="selectProp1" />
      <q-select label-color="green" class="q-pa-xs col" v-model="selectedModel2" square label="model2" hide-hint
        :options="modelNames" dense dark stack-label @update:model-value="selectModel2" />
      <q-select v-if="selectedModel2 !== ''" label-color="green" class="q-pa-xs col" v-model="selectedProp2" square
        label="prop2" hide-hint :options="prop2Names" dense dark stack-label @update:model-value="selectProp2" />
      <q-select label-color="light-blue" class="q-pa-xs col" v-model="selectedModel3" square label="model3" hide-hint
        :options="modelNames" dense dark stack-label @update:model-value="selectModel3" />
      <q-select v-if="selectedModel3 !== ''" label-color="light-blue" class="q-pa-xs col" v-model="selectedProp3" square
        label="select model" hide-hint :options="prop3Names" dense dark stack-label @update:model-value="selectProp3" />
    </div>

    <!-- chart -->
    <Line v-if="isEnabled" ref="myTest" id="my-chart-id" :options="chartOptions" :data="chartData"
      style="max-height: 300px;" />
    <!-- presets -->
    <div v-if="isEnabled && showPresets" class="text-overline justify-center q-gutter-xs row q-mb-sm">
      <div class="q-mb-sm text-left text-secondary" :style="{ 'font-size': '12px' }">
      </div>
      <q-select v-if="!presetEditMode" class="q-pa-xs" v-model="selectedPresetName" square label="selected preset"
        hide-hint :options="presetNames" dense dark :style="{ 'width': '200px' }" stack-label
        @update:model-value="selectPreset" />
      <q-input v-if="presetEditMode" class="q-pa-xs" v-model="newPresetName" square label="new preset name" hide-hint
        dense dark :style="{ 'width': '200px' }" stack-label />
      <q-btn v-if="presetEditMode" class="q-ma-sm" color="black" size="xs" icon="fa-solid fa-plus" @click="addToPresets"
        style="font-size: 8px; width: 50px;"><q-tooltip>add to presets</q-tooltip></q-btn>

      <q-btn v-if="!presetEditMode" class="q-ma-sm" color="black" size="xs" icon="fa-solid fa-bookmark"
        @click="makeNewPreset" style="font-size: 8px; width: 50px;"><q-tooltip>bookmark current
          configuration</q-tooltip></q-btn>

    </div>
    <!-- bottom buttons -->
    <div v-if="isEnabled" class="q-ma-sm text-overline justify-center q-gutter-sm row">
      <q-checkbox v-if="autoscaleEnabled" v-model="autoscale" dense size="xs" label="autoscale"
        @update:model-value="toggleAutoscaling" />
      <q-input v-if="!autoscale" v-model.number="y_min" type="number" @update:model-value="autoscaling" label="y min"
        filled dense hide-bottom-space style="max-width: 75px;" />
      <q-input v-if="!autoscale" v-model.number="y_max" type="number" @update:model-value="autoscaling" label="y max"
        filled dense hide-bottom-space style="max-width: 75px;" />

      <q-checkbox v-if="multipliersEnabled" v-model="scaling" @update:model-value="toggleFactors" dense size="xs"
        label="factors" />
      <q-input v-if="scaling && selectedProp1 !== ''" v-model.number="chart1_factor" type="number" label="y1 factor"
        filled dense style="max-width: 75px;" />
      <q-input v-if="scaling && selectedProp2 !== ''" v-model.number="chart2_factor" type="number" label="y2 factor"
        filled dense style="max-width: 75px;" />
      <q-input v-if="scaling && selectedProp3 !== ''" v-model.number="chart3_factor" type="number" label="y3 factor"
        filled dense style="max-width: 75px;" />

      <q-checkbox v-if="analysisEnabled" v-model="show_summary" dense label="statistics" size="sm"
        @update:model-value="toggleSummary" />
      <q-checkbox v-if="presetsEnabled" v-model="showPresets" dense label="presets" size="sm" />
      <q-checkbox v-model="chart_fill" dense label="fill" size="sm" />
      <q-toggle v-model="state.configuration.chart_hires" label="hi-res" dense size="sm"
        @update:model-value="toggleHires" />
      <q-input v-if="!this.state.configuration.chart_hires" v-model.number="rtWindow" type="number" label="time" filled
        dense min="1" max="30" hide-bottom-space @update:model-value="updateRtWindow" />
      <q-btn v-if="exportEnabled" color="black" size="sm" @click="exportData" icon="fa-solid fa-file-export"></q-btn>
      <q-btn color="negative" size="xs" @click="clearProps" icon="fa-solid fa-trash-can"></q-btn>
    </div>


    <!-- statistics -->
    <div v-if="show_summary && isEnabled" class="q-mt-sm">
      <div v-if="p1 !== '' && show_summary" class="q-gutter-xs row justify-center q-mt-xs">
        <q-input label-color="red" color="black" v-model="p1_max" outlined dense square label="y1 max"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="red" color="black" v-model="p1_min" outlined dense square label="y1 min"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="red" color="black" v-model="p1_mean" outlined dense square label="y1 mean"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="red" color="black" v-model="p1_sd" outlined dense square label="y1 sd"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="red" color="black" v-model="p1_permin" outlined dense square label="y1 /min"
          style="width: 100px; font-size: 12px" />
      </div>
      <div v-if="p2 !== '' && show_summary" class="q-gutter-xs row justify-center q-mt-xs">
        <q-input label-color="green" color="black" v-model="p2_max" outlined dense square label="y2 max"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="green" color="black" v-model="p2_min" outlined dense square label="y2 min"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="green" color="black" v-model="p2_mean" outlined dense square label="y2 mean"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="green" color="black" v-model="p2_sd" outlined dense square label="y2 sd"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="green" color="black" v-model="p2_permin" outlined dense square label="y2 /min"
          style="width: 100px; font-size: 12px" />
      </div>
      <div v-if="p3 !== '' && show_summary" class="q-gutter-xs row justify-center q-mt-xs">
        <q-input label-color="light-blue" color="black" v-model="p3_max" outlined dense square label="y3 max"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="light-blue" color="black" v-model="p3_min" outlined dense square label="y3 min"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="light-blue" color="black" v-model="p3_mean" outlined dense square label="y3 mean"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="light-blue" color="black" v-model="p3_sd" outlined dense square label="y3 sd"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="light-blue" color="black" v-model="p3_permin" outlined dense square label="y3 /min"
          style="width: 100px; font-size: 12px" />
      </div>

    </div>




  </q-card>
</template>

<script>
import { useStateStore } from "src/stores/state";
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js'
import { ref, shallowRef } from 'vue'
import * as Stat from "simple-statistics";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler)


export default {
  setup() {
    const state = useStateStore()

    let y1_axis_fill = false
    let y2_axis_fill = false
    let y3_axis_fill = false

    // make the chartdata reactive
    let chartData = {
      labels: [],
      datasets: [
        {
          data: [],
          fill: y1_axis_fill,
          borderColor: 'rgb(192, 0, 0, 1.0)',
          backgroundColor: 'rgba(192, 0, 0, 0.3)',
          borderWidth: 1,
          pointStyle: false
        }, {
          data: [],
          fill: y2_axis_fill,
          borderColor: 'rgb(0, 192, 0, 1.0)',
          backgroundColor: 'rgba(0, 192, 0, 0.3)',
          borderWidth: 1,
          pointStyle: false
        }, {
          data: [],
          fill: y3_axis_fill,
          borderColor: 'rgb(0, 192, 192, 1.0)',
          backgroundColor: 'rgb(0, 192, 192, 0.3)',
          borderWidth: 1,
          pointStyle: false
        }]
    }

    let chartOptions = shallowRef({
      responsive: true,
      animation: false,
      spanGaps: true,
      showLine: true,
      plugins: {
        legend: {
          display: false
        }
      },
      datasets: {
        line: {
          pointRadius: 0 // disable for all `'line'` datasets
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            color: '#444444'
          },
          border: {
            display: false
          }
        },
        y: {
          grid: {
            color: '#333333'
          },
          border: {
            display: false
          }
        }
      }
    })

    return {
      state,
      chartData,
      chartOptions,
      y1_axis_fill,
      y2_axis_fill,
      y3_axis_fill
    }

  },
  props: {
    alive: Boolean

  },
  components: {
    Bar,
    Line,
    Scatter
  },
  data() {
    return {
      presetsEnabled: true,
      showPresets: true,
      show_summary: false,
      rtWindow: 3,
      rtWindowValidated: 3,
      analysisEnabled: true,
      autoscaleEnabled: true,
      autoscale: true,
      loopMode: false,
      x_min: 0,
      x_max: 5.0,
      y_min: 0,
      y_max: 100,
      multipliersEnabled: true,
      scaling: false,
      chart1_factor: 1.0,
      chart2_factor: 1.0,
      chart3_factor: 1.0,
      exportEnabled: true,
      title: "TIME CHART",
      isEnabled: true,
      selectedModel1: "",
      selectedProp1: "",
      p1: "",
      p1_max: 0.0,
      p1_min: 0.0,
      p1_sd: 0.0,
      p1_mean: 0.0,
      p1_permin: 0.0,
      p1_perbeat: 0.0,
      selectedModel2: "",
      selectedProp2: "",
      p2: "",
      p2_max: 0.0,
      p2_min: 0.0,
      p2_sd: 0.0,
      p2_mean: 0.0,
      p2_permin: 0.0,
      p2_perbeat: 0.0,
      selectedModel3: "",
      selectedProp3: "",
      p3: "",
      p3_max: 0.0,
      p3_min: 0.0,
      p3_sd: 0.0,
      p3_mean: 0.0,
      p3_permin: 0.0,
      p3_perbeat: 0.0,
      modelNames: [],
      prop1Names: [],
      prop2Names: [],
      prop3Names: [],
      seconds: 0,
      x_axis: [],
      y1_axis: [],
      y2_axis: [],
      y3_axis: [],
      chart_fill: false,
      // y1_axis_fill: false,
      // y2_axis_fill: false,
      // y3_axis_fill: false,
      redrawInterval: -1,
      redrawTimer: 0.0,
      debug_mode: true,
      presetEditMode: false,
      selectedPresetName: "",
      presetNames: [],
      newPresetName: "",
      presets: {
        "Pva": {
          props: ["Mob.pva", "Mob.pva_running"],
          autoscale: true,
          y_min: 0.0,
          y_max: 35,
          factors: false,
          fill: false,
          chart1_factor: 100000,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
        "Mob": {
          props: ["Mob.bm_vo2", "Mob.cor_po2"],
          autoscale: false,
          y_min: 0.0,
          y_max: 35,
          factors: true,
          fill: false,
          chart1_factor: 100000,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
        "Brain and coronary avg flow": {
          props: ["AA_BR.flow_lmin_avg", "AA_COR.flow_lmin_avg"],
          autoscale: false,
          y_min: 0.0,
          y_max: 0.3,
          factors: false,
          fill: false,
          chart1_factor: 1.0,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
        "Brain and coronary instant flow": {
          props: ["AA_BR.flow", "AA_COR.flow"],
          autoscale: false,
          y_min: 0.005,
          y_max: 0.0001,
          factors: false,
          fill: false,
          chart1_factor: 1.0,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
        "Compressions": {
          props: ["Resuscitation.chest_comp_force", "ALL.pres_rel"],
          autoscale: true,
          y_min: -5,
          y_max: 5,
          factors: false,
          fill: false,
          chart1_factor: 1.0,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
        "PDA Doppler": {
          props: ["Shunts.da_velocity"],
          autoscale: false,
          y_min: -2,
          y_max: 3,
          factors: false,
          fill: true,
          chart1_factor: 1.0,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
        "Heart": {
          props: ["LV.pres", "RV.pres"],
          autoscale: true,
          y_min: 0,
          y_max: 7,
          factors: false,
          fill: false,
          chart1_factor: 1.0,
          chart2_factor: 1.0,
          chart3_factor: 1.0
        },
      }
    };
  },
  methods: {
    toggleHires() {

      if (this.state.configuration.chart_hires) {
        this.rtWindow = 1.0
        explain.setSampleInterval(0.0015)
      } else {
        this.rtWindow = 3.0
        explain.setSampleInterval(0.005)
      }
    },
    makeNewPreset() {
      this.presetEditMode = true

    },
    addToPresets() {
      this.presetEditMode = false
      if (this.newPresetName) {
        let preset = {
          props: [this.p1, this.p2, this.p3],
          autoscale: this.autoscale,
          y_min: this.y_min,
          y_max: this.y_max,
          factors: this.scaling,
          fill: this.chart_fill,
          chart1_factor: this.chart1_factor,
          chart2_factor: this.chart2_factor,
          chart3_factor: this.chart3_factor,
        }
        this.presetNames.push(this.newPresetName)
        this.presets[this.newPresetName] = { ...preset }
        this.newPresetName = ""
      }

    },
    clearProps() {
      this.p1 = ""
      this.selectedModel1 = ""
      this.selectedProp1 = ""
      this.p2 = ""
      this.selectedModel2 = ""
      this.selectedProp2 = ""
      this.p3 = ""
      this.selectedModel3 = ""
      this.selectedProp3 = ""
      this.selectedPresetName = ""
    },
    selectPreset(preset_name) {
      if (preset_name) {
        this.processDefault(this.presets[preset_name])
      }
    },
    processDefault(settings) {
      this.clearProps()
      let _default = [...settings.props]
      explain.watchModelProps(_default)

      this.autoscale = settings.autoscale
      this.y_min = settings.y_min
      this.y_max = settings.y_max
      this.autoscaling()

      this.scaling = settings.factors
      this.chart_fill = settings.fill
      this.chart1_factor = settings.chart1_factor
      this.chart2_factor = settings.chart2_factor
      this.chart3_factor = settings.chart3_factor
      this.toggleFactors()

      if (_default.length > 0) {
        let p1 = _default[0].split(".")
        this.p1 = _default[0]
        this.selectedModel1 = p1[0]
        this.selectedProp1 = p1[1]
      }

      if (_default.length > 1) {
        let p2 = _default[1].split(".")
        this.p2 = _default[1]
        this.selectedModel2 = p2[0]
        this.selectedProp2 = p2[1]
      }

      if (_default.length > 2) {
        let p3 = _default[2].split(".")
        this.p3 = _default[2]
        this.selectedModel3 = p3[0]
        this.selectedProp3 = p3[1]
      }
    },
    toggleFactors() {
      if (!this.scaling) {
        this.chart1_factor = 1.0
        this.chart2_factor = 1.0
        this.chart3_factor = 1.0
      }
    },
    updateRtWindow() {
      if (this.rtWindow < 1.0) {
        this.rtWindow = 1.0
      }
      if (this.rtWindow > 10.0) {
        this.rtWindow = 10.0
      }

      this.rtWindowValidated = this.rtWindow

    },
    resetAnalysis() {
      this.p1_max = 0.0
      this.p1_min = 0.0
      this.p1_sd = 0.0
      this.p1_mean = 0.0
      this.p1_permin = 0.0
      this.p1_perbeat = 0.0

      this.p2_max = 0.0
      this.p2_min = 0.0
      this.p2_sd = 0.0
      this.p2_mean = 0.0
      this.p2_permin = 0.0
      this.p2_perbeat = 0.0

      this.p3_max = 0.0
      this.p3_min = 0.0
      this.p3_sd = 0.0
      this.p3_mean = 0.0
      this.p3_permin = 0.0
      this.p3_perbeat = 0.0
    },
    analyzeDataRt() {
      if (this.p1 !== '') {
        this.p1_max = Stat.max(this.y1_axis).toFixed(4)
        this.p1_min = Stat.min(this.y1_axis).toFixed(4)
        this.p1_sd = Stat.standardDeviation(this.y1_axis).toFixed(4)
        this.p1_mean = Stat.mean(this.y1_axis).toFixed(4)
        this.p1_permin = Stat.sum(this.y1_axis).toFixed(4)
        this.p1_perbeat = 0.0
      }

      if (this.p2 !== '') {
        this.p2_max = Stat.max(this.y2_axis).toFixed(4)
        this.p2_min = Stat.min(this.y2_axis).toFixed(4)
        this.p2_sd = Stat.standardDeviation(this.y2_axis).toFixed(4)
        this.p2_mean = Stat.mean(this.y2_axis).toFixed(4)
        this.p2_permin = Stat.sum(this.y2_axis).toFixed(4)
        this.p2_perbeat = 0.0
      }

      if (this.p3 !== '') {
        this.p3_max = Stat.max(this.y3_axis).toFixed(4)
        this.p3_min = Stat.min(this.y3_axis).toFixed(4)
        this.p3_sd = Stat.standardDeviation(this.y3_axis).toFixed(4)
        this.p3_mean = Stat.mean(this.y3_axis).toFixed(4)
        this.p3_permin = Stat.sum(this.y3_axis).toFixed(4)
        this.p3_perbeat = 0.0
      }

    },
    analyzeData() {

      this.resetAnalysis()

      let param1 = []
      let param2 = []
      let param3 = []

      if (this.p1 !== '') {
        param1 = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
        this.p1_max = Stat.max(param1).toFixed(4)
        this.p1_min = Stat.min(param1).toFixed(4)
        this.p1_sd = Stat.standardDeviation(param1).toFixed(4)
        this.p1_mean = Stat.mean(param1).toFixed(4)
        this.p1_permin = Stat.sum(param1).toFixed(4)
        this.p1_perbeat = 0.0
      }

      if (this.p2 !== '') {
        param2 = explain.modelData.map((item) => { return item[this.p2] * this.chart2_factor; });
        this.p2_max = Stat.max(param2).toFixed(4)
        this.p2_min = Stat.min(param2).toFixed(4)
        this.p2_sd = Stat.standardDeviation(param2).toFixed(4)
        this.p2_mean = Stat.mean(param2).toFixed(4)
        this.p2_permin = Stat.sum(param2).toFixed(4)
        this.p2_perbeat = 0.0
      }

      if (this.p3 !== '') {
        param3 = explain.modelData.map((item) => { return item[this.p3] * this.chart3_factor; });
        this.p3_max = Stat.max(param3).toFixed(4)
        this.p3_min = Stat.min(param3).toFixed(4)
        this.p3_sd = Stat.standardDeviation(param3).toFixed(4)
        this.p3_mean = Stat.sum(param3).toFixed(4)
        this.p3_permin = 0.0
        this.p3_perbeat = 0.0
      }



    },
    toggleAutoscaling() {
      this.y_max = parseFloat(this.chartData.datasets[0].data.reduce((max, current) => (current > max ? current : max), -Infinity))
      this.y_min = parseFloat(this.chartData.datasets[0].data.reduce((min, current) => (current < min ? current : min), Infinity))
      this.autoscaling()
    },
    autoscaling() {
      if (!this.autoscale) {
        this.chartOptions = {
          responsive: true,
          animation: false,
          spanGaps: true,
          showLine: true,
          plugins: {
            legend: {
              display: false
            }
          },
          datasets: {
            line: {
              pointRadius: 0 // disable for all `'line'` datasets
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              min: this.y_min,
              max: this.y_max,
              grid: {
                color: '#333333'
              },
            }
          }
        }
      } else {
        this.chartOptions = {
          responsive: true,
          animation: false,
          spanGaps: true,
          showLine: true,
          plugins: {
            legend: {
              display: false
            }
          },
          datasets: {
            line: {
              pointRadius: 0 // disable for all `'line'` datasets
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              grid: {
                color: '#333333'
              },
            }
          }
        }
      }


    },
    selectModel1() {
      this.prop1Names = [""]
      this.selectedProp1 = ""
      this.p1 = ""
      if (this.selectedModel1 !== "") {
        Object.keys(explain.modelState.models[this.selectedModel1]).forEach(prop => {
          if (typeof (explain.modelState.models[this.selectedModel1][prop]) === 'number') {
            if (prop[0] !== "_") {
              this.prop1Names.push(prop)
            }
          }
        })
        this.prop1Names.sort()
      } else {
        this.selectedProp1 = ""
        this.p1 = ""
      }
    },
    selectProp1() {
      if (this.selectedProp1 !== "") {
        this.p1 = this.selectedModel1 + "." + this.selectedProp1
        explain.watchModelProps([this.p1])
      } else {
        this.selectedModel1 = ""
        this.p1 = ""
      }
    },
    selectModel2() {
      this.prop2Names = [""]
      this.selectedProp2 = ""
      this.p2 = ""
      if (this.selectedModel2 !== "") {
        Object.keys(explain.modelState.models[this.selectedModel2]).forEach(prop => {
          if (typeof (explain.modelState.models[this.selectedModel2][prop]) === 'number') {
            if (prop[0] !== "_") {
              this.prop2Names.push(prop)
            }
          }
        })
        this.prop2Names.sort()
      } else {
        this.selectedProp2 = ""
        this.p2 = ""
      }
    },
    selectProp2() {
      if (this.selectedProp2 !== "") {
        this.p2 = this.selectedModel2 + "." + this.selectedProp2
        explain.watchModelProps([this.p2])
      } else {
        this.selectedModel2 = ""
        this.p2 = ""
      }
    },
    selectModel3() {
      this.prop3Names = [""]
      this.selectedProp3 = ""
      this.p3 = ""
      if (this.selectedModel3 !== "") {
        Object.keys(explain.modelState.models[this.selectedModel3]).forEach(prop => {
          if (typeof (explain.modelState.models[this.selectedModel3][prop]) === 'number') {
            if (prop[0] !== "_") {
              this.prop3Names.push(prop)
            }
          }
        })
        this.prop3Names.sort()
      } else {
        this.selectedProp3 = ""
        this.p3 = ""
      }
    },
    selectProp3() {
      if (this.selectedProp3 !== "") {
        this.p3 = this.selectedModel3 + "." + this.selectedProp3
        explain.watchModelProps([this.p3])
      } else {
        this.selectedModel3 = ""
        this.p3 = ""
      }
    },
    dataUpdateRt() {
      if (this.alive) {
        this.y1_axis_fill = this.chart_fill
        this.y2_axis_fill = this.chart_fill
        this.y3_axis_fill = this.chart_fill

        // update is every 0.015 ms and the data is sampled with 0.0015 ms resolution (so 3 data points per 0.015 sec = 200 datapoints per second)
        for (let i = 0; i < explain.modelData.length; i++) {
          this.y1_axis.push(explain.modelData[i][this.p1] * this.chart1_factor)
          this.y2_axis.push(explain.modelData[i][this.p2] * this.chart2_factor)
          this.y3_axis.push(explain.modelData[i][this.p3] * this.chart3_factor)
          this.x_axis.push(this.seconds)
          this.seconds += 0.005;
        }

        if (this.x_axis.length > this.rtWindowValidated * 200.0) {
          let too_many = this.x_axis.length - (this.rtWindowValidated * 200.0)
          this.x_axis.splice(0, too_many)
          this.y1_axis.splice(0, too_many)
          this.y2_axis.splice(0, too_many)
          this.y3_axis.splice(0, too_many)
        }

        if (this.redrawTimer > this.redrawInterval) {
          this.redrawTimer = 0;
          const myChart = this.$refs.myTest.chart
          myChart.data.labels = this.x_axis
          myChart.data.datasets[0].data = [...this.y1_axis]
          myChart.data.datasets[1].data = [...this.y2_axis]
          myChart.data.datasets[2].data = [...this.y3_axis]
          requestAnimationFrame(() => {
            myChart.update()
          })

          if (this.show_summary) {
            this.analyzeDataRt()
          }


          this.redrawTimer = 0;
          this.chartData = {
            labels: this.x_axis,
            datasets: [
              {
                data: [...this.y1_axis],
                fill: this.y1_axis_fill,
                borderColor: 'rgb(192, 0, 0, 1.0)',
                backgroundColor: 'rgba(192, 0, 0, 0.3)',
                borderWidth: 1,
                pointStyle: false
              }, {
                data: [...this.y2_axis],
                fill: this.y2_axis_fill,
                borderColor: 'rgb(0, 192, 0, 1.0)',
                backgroundColor: 'rgba(0, 192, 0, 0.3)',
                borderWidth: 1,
                pointStyle: false
              }, {
                data: [...this.y3_axis],
                fill: this.y3_axis_fill,
                borderColor: 'rgb(0, 192, 192, 1.0)',
                backgroundColor: 'rgb(0, 192, 192, 0.3)',
                borderWidth: 1,
                pointStyle: false
              }]
          }

          if (this.show_summary) {
            this.analyzeDataRt()
          }

        }
        this.redrawTimer += 0.015
      }
    },
    processAvailableModels() {
      this.modelNames = [""]
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)]
          this.modelNames.push("")
          this.modelNames.sort()

        }
      } catch { }
    },
    toggleSummary() {
      if (this.show_summary) {
        this.analyzeData()
      }

    },
    dataUpdate() {

      let data_sets = []

      this.y1_axis_fill = this.chart_fill
      this.y2_axis_fill = this.chart_fill
      this.y3_axis_fill = this.chart_fill

      if (this.p1 !== '') {
        this.y1_axis = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
        data_sets.push({
          data: this.y1_axis,
          borderColor: 'rgb(192, 0, 0, 1.0)',
          backgroundColor: 'rgb(192, 0, 0, 0.3)',
          fill: this.y1_axis_fill,
          borderWidth: 1,
          pointStyle: false
        })
      }

      if (this.p2 !== '') {
        this.y2_axis = explain.modelData.map((item) => { return item[this.p2] * this.chart2_factor; });
        data_sets.push({
          data: this.y2_axis,
          borderColor: 'rgb(0, 192, 0, 1.0)',
          backgroundColor: 'rgb(0, 192, 0, 0.3)',
          fill: this.y2_axis_fill,
          borderWidth: 1,
          pointStyle: false
        });
      }

      if (this.p3 !== '') {
        this.y3_axis = explain.modelData.map((item) => { return item[this.p3] * this.chart3_factor; });
        data_sets.push({
          data: this.y3_axis,
          borderColor: 'rgb(0, 192, 192, 1.0)',
          backgroundColor: 'rgb(0, 192, 192, 0.3)',
          fill: this.y3_axis_fill,
          borderWidth: 1,
          pointStyle: false
        });
      }

      if (data_sets.length > 0) {
        this.x_axis = [...Array(this.y1_axis.length).keys()]
      }

      this.chartData = {
        labels: this.x_axis,
        datasets: [...data_sets]
      }

      if (this.show_summary) {
        this.analyzeDataRt()
      }
      // prepare for realtime analysis
      this.seconds = 0
      this.x_axis = []
      this.y1_axis = []
      this.y2_axis = []
      this.y3_axis = []

    },
    exportData() {
      let header = ""
      let data = {
        time: explain.modelData.map((item) => { return parseFloat(item['time']) }),
      }

      if (this.p1 !== "") {
        let h1 = this.selectedModel1.toUpperCase() + this.selectedProp1.toUpperCase() + "_";
        header += h1
        data[h1] = explain.modelData.map((item) => { return (parseFloat(item[this.p1])) });
      }
      if (this.p2 !== "") {
        let h2 = this.selectedModel2.toUpperCase() + this.selectedProp2.toUpperCase() + "_";
        header += h2
        data[h2] = explain.modelData.map((item) => { return (parseFloat(item[this.p2])) });
      }
      if (this.p3 !== "") {
        let h3 = this.selectedModel3.toUpperCase() + this.selectedProp3.toUpperCase();
        header += h3
        data[h3] = explain.modelData.map((item) => { return (parseFloat(item[this.p3])) });
      }
      this.exportFileName = `time_vs_${header}.csv`;
      this.writeDataToDisk(data)

    },
    writeDataToDisk(data) {
      // download to local disk
      const data_csv = this.convertToCSV(data)
      const blob = new Blob([data_csv], { type: "text/json" });
      // create an element called a
      const a = document.createElement("a");
      a.download = this.exportFileName;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      // create a synthetic click MouseEvent
      let evt = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      // dispatch the mouse click event
      a.dispatchEvent(evt);
      // remove the element from the document
      a.remove();
    },
    convertToCSV(obj) {
      const headers = Object.keys(obj);
      const rows = [];

      // Push the headers as the first row
      rows.push(headers.join(','));

      // Determine the number of rows needed by checking the length of one of the arrays
      const numRows = obj[headers[0]].length;

      // Loop through the rows of data
      for (let i = 0; i < numRows; i++) {
        const rowData = headers.map((header) => obj[header][i]);
        rows.push(rowData.join(','));
      }

      return rows.join('\n');
    }
  },
  beforeUnmount() {
  },
  mounted() {
    // get the realtime slow data
    this.$bus.on("rtf", () => {
      this.dataUpdateRt()
    });

    // listen for state and data changes
    this.$bus.on("state", this.processAvailableModels)
    this.$bus.on("data", () => this.dataUpdate())

    // fill the presets selector
    this.presetNames = Object.keys(this.presets)

    // check whether hires is enabled
    this.toggleHires()

  },
};
</script>

<style></style>
