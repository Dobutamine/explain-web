<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>


    <!-- chart -->
    <div v-if="!show_loops">
      <div class="q-mt-sm row text-overline justify-center">pressure (cmh2o)</div>
      <Line v-if="isEnabled && !show_loops" ref="myChartPres" id="my-chart-heart-pres" :options="chartOptionsPres"
        :data="chartDataPres" style="max-height: 150px;" />
      <div class="q-mt-sm row text-overline justify-center">flow (l/s)</div>
      <Line v-if="isEnabled && !show_loops" ref="myChartFlow" id="my-chart-heart-flow" :options="chartOptionsFlow"
        :data="chartDataFlow" style="max-height: 150px;" />
      <div class="row text-overline justify-center">volume (ml)</div>
      <Line v-if="isEnabled" ref="myChartVol" id="my-chart-vent-vol" :options="chartOptionsVol" :data="chartDataVol"
        style="max-height: 150px;" />
    </div>

    <XYChartComponent v-if="isEnabled && show_loops" :alive="show_loops" title="" :presets="presets_loops"
      :load-preset="true"></XYChartComponent>

    <div v-if="isEnabled" class="q-mt-sm text-overline justify-center q-gutter-xs row">
      <div v-if="!show_loops">
        <q-btn-toggle v-model="mode" color="grey-9" size="sm" text-color="white" toggle-color="primary" :options="[
          { label: 'LEFT HEART', value: 'LEFT' },
          { label: 'RIGHT HEART', value: 'RIGHT' },
        ]" @update:model-value="select_heart_chamber" />
      </div>
    </div>
    <div v-if="isEnabled" class="q-mt-sm text-overline justify-center q-gutter-xs row">
      <div>
        <q-btn-toggle class="q-ml-sm q-mb-sm" v-model="show_loops" color="grey-9" size="sm" text-color="white"
          toggle-color="primary" :options="[
            { label: 'CURVES', value: false },
            { label: 'LOOPS', value: true },
          ]" />
      </div>
      <div>
        <q-toggle v-if="!show_loops" class="q-ml-sm q-pb-lg" v-model="state.configuration.chart_hires" label="hi-res"
          dense size="sm" @update:model-value="toggleHires" />
      </div>
      <div>
        <q-input v-if="!show_loops && !state.configuration.chart_hires" class="q-ml-sm q-pb-lg"
          v-model.number="rtWindow" type="number" label="time" filled dense min="1" max="30" hide-bottom-space
          @update:model-value="updateRtWindow" />
      </div>

    </div>
    <!-- ventilator controls -->

  </q-card>
</template>

<script>
import { useStateStore } from "src/stores/state";
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { ref, shallowRef } from 'vue'
import * as Stat from "simple-statistics";
import XYChartComponent from "./XYChartComponent.vue";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)
export default {
  setup() {
    const state = useStateStore()

    let p1_color = ref("rgb(192, 0, 0)")
    let p2_color = ref("rgb(0, 192, 0)")
    let p3_color = ref("rgb(0, 192, 192)")
    let p4_color = ref("rgb(192, 0, 192)")
    let p5_color = ref("rgb(192, 192, 0)")
    let p6_color = ref("rgb(0, 192, 192)")
    let p7_color = ref("rgb(192, 192, 192)")

    // make the chartdata reactive
    let chartDataPres = {
      labels: [],
      backgroundColor: '#888888',
      datasets: [{
        data: [],
        borderColor: p1_color,
        borderWidth: 1,
        pointStyle: false
      },
      {
        data: [],
        borderColor: p2_color,
        borderWidth: 1,
        pointStyle: false
      },
      {
        data: [],
        borderColor: p3_color,
        borderWidth: 1,
        pointStyle: false
      },
      ]
    }


    let chartDataFlow = {
      labels: [],
      backgroundColor: '#888888',
      datasets: [{
        data: [],
        borderColor: p5_color,
        borderWidth: 1,
        pointStyle: false
      },
      {
        data: [],
        borderColor: p6_color,
        borderWidth: 1,
        pointStyle: false
      }
      ]
    }


    let chartDataVol = {
      labels: [],
      backgroundColor: '#888888',
      datasets: [{
        data: [],
        borderColor: p4_color,
        borderWidth: 1,
        pointStyle: false
      },
      {
        data: [],
        borderColor: p7_color,
        borderWidth: 1,
        pointStyle: false
      }
      ]
    }

    let chartOptionsPres = shallowRef({
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
    let chartOptionsFlow = shallowRef({
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
    let chartOptionsVol = shallowRef({
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
      chartDataPres,
      chartDataFlow,
      chartDataVol,
      chartOptionsPres,
      chartOptionsFlow,
      chartOptionsVol,
      p1_color,
      p2_color,
      p3_color,
      p4_color,
      p5_color,
      p6_color,
      p7_color

    }

  },
  props: {
    alive: Boolean
  },
  components: {
    Bar,
    Line,
    Scatter,
    XYChartComponent
  },
  data() {
    return {
      ventilator_running: false,
      spont_breathing: true,
      presetsEnabled: true,
      showPresets: false,
      show_summary: false,
      show_loops: false,
      rtWindow: 3,
      rtWindowValidated: 3,
      analysisEnabled: true,
      autoscaleEnabled: true,
      autoscale: false,
      loopMode: false,
      isEnabled: true,
      et_tube_diameter: 3.5,
      et_tube_length: 110,
      pip_caption: "pip",
      pip_cmh2o: 14.0,
      peep_cmh2o: 4.0,
      hfo_map_cmh2o: 10,
      hfo_amplitude_cmh2o: 20,
      hfo_freq: 10,
      hfo_bias_flow: 10,
      freq: 40,
      insp_time: 0.4,
      insp_flow: 8.0,
      tidal_volume: 15,
      fio2: 21,
      temp: 37.0,
      humidity: 100,
      trigger_perc: 6.0,
      mode: "LEFT",
      x_min: 2,
      x_max: 15.0,
      y_min: 0,
      y_max: 25,
      multipliersEnabled: true,
      scaling: false,
      chart1_factor: 1.0,
      chart2_factor: 1.0,
      chart3_factor: 1.0,
      chart4_factor: 1000.0,
      chart5_factor: 1.0,
      chart6_factor: 1.0,
      chart7_factor: 1000.0,
      exportEnabled: true,
      title: "HEART AND CIRCULATION",
      selectedModel1: "LV",
      selectedProp1: "pres",
      p1: "LV.pres",
      p1_max: 0.0,
      p1_min: 0.0,
      p1_sd: 0.0,
      p1_mean: 0.0,
      p1_permin: 0.0,
      p1_perbeat: 0.0,
      selectedModel2: "LA",
      selectedProp2: "pres",
      p2: "LA.pres",
      p2_max: 0.0,
      p2_min: 0.0,
      p2_sd: 0.0,
      p2_mean: 0.0,
      p2_permin: 0.0,
      p2_perbeat: 0.0,
      selectedModel3: "AA",
      selectedProp3: "pres",
      p3: "AA.pres",
      p3_max: 0.0,
      p3_min: 0.0,
      p3_sd: 0.0,
      p3_mean: 0.0,
      p3_permin: 0.0,
      p3_perbeat: 0.0,
      selectedModel4: "LV",
      selectedProp4: "vol",
      p4: "LV.vol",
      p4_max: 0.0,
      p4_min: 0.0,
      p4_sd: 0.0,
      p4_mean: 0.0,
      p4_permin: 0.0,
      p4_perbeat: 0.0,
      selectedModel5: "LV_AA",
      selectedProp5: "flow",
      p5: "LV_AA.flow",
      p5_max: 0.0,
      p5_min: 0.0,
      p5_sd: 0.0,
      p5_mean: 0.0,
      p5_permin: 0.0,
      p5_perbeat: 0.0,
      selectedModel6: "LA_LV",
      selectedProp6: "flow",
      p6: "LA_LV.flow",
      p6_max: 0.0,
      p6_min: 0.0,
      p6_sd: 0.0,
      p6_mean: 0.0,
      p6_permin: 0.0,
      p6_perbeat: 0.0,
      selectedModel7: "LA",
      selectedProp7: "vol",
      p7: "LA.vol",
      p7_max: 0.0,
      p7_min: 0.0,
      p7_sd: 0.0,
      p7_mean: 0.0,
      p7_permin: 0.0,
      p7_perbeat: 0.0,
      seconds: 0,
      x_axis: [],
      y1_axis: [],
      y2_axis: [],
      y3_axis: [],
      y4_axis: [],
      y5_axis: [],
      y6_axis: [],
      y7_axis: [],
      redrawInterval: 0.029,
      redrawTimer: 0.0,
      debug_mode: true,
      presets: {},
      presets_loops: {
        "LV LOOP": ["LV.vol", "LV.pres"],
        "LA LOOP": ["LA.vol", "LA.pres"],
        "RV LOOP": ["RV.vol", "RV.pres"],
        "RA LOOP": ["RA.vol", "RA.pres"],
      },
      update_model: true
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


    select_heart_chamber() {
      switch (this.mode) {
        case "LEFT":
          this.p1 = "LV.pres"
          this.selectedModel1 = "LV"
          this.selectedProp1 = "pres"
          this.p2 = "LA.pres"
          this.selectedModel2 = "LA"
          this.selectedProp2 = "pres"
          this.p3 = "AA.pres"
          this.selectedModel3 = "AA"
          this.selectedProp3 = "pres"
          this.p4 = "LV.vol"
          this.selectedModel4 = "LV"
          this.selectedProp4 = "vol"
          this.p5 = "LV_AA.flow"
          this.selectedModel5 = "LV_AA"
          this.selectedProp5 = "flow"
          this.p6 = "LA_LV.flow"
          this.selectedModel6 = "LA_LV"
          this.selectedProp6 = "flow"
          this.p7 = "LA.vol"
          this.selectedModel7 = "LA"
          this.selectedProp7 = "vol"

          break;
        case "RIGHT":
          this.p1 = "RV.pres"
          this.selectedModel1 = "RV"
          this.selectedProp1 = "pres"
          this.p2 = "RA.pres"
          this.selectedModel2 = "RA"
          this.selectedProp2 = "pres"
          this.p3 = "PA.pres"
          this.selectedModel3 = "PA"
          this.selectedProp3 = "pres"
          this.p4 = "RV.vol"
          this.selectedModel4 = "RV"
          this.selectedProp4 = "vol"
          this.p5 = "RV_PA.flow"
          this.selectedModel5 = "RV_PA"
          this.selectedProp5 = "flow"
          this.p6 = "RA_RV.flow"
          this.selectedModel6 = "RA_RV"
          this.selectedProp6 = "flow"
          this.p7 = "RA.vol"
          this.selectedModel7 = "RA"
          this.selectedProp7 = "vol"
          break;
      }
    },
    clearProps() {
      this.p1 = "LV.pres"
      this.selectedModel1 = "LV"
      this.selectedProp1 = "pres"
      this.p2 = "LA.pres"
      this.selectedModel2 = "LA"
      this.selectedProp2 = "pres"
      this.p3 = "AA.pres"
      this.selectedModel3 = "AA"
      this.selectedProp3 = "pres"
      this.p4 = "LV.vol"
      this.selectedModel4 = "LV"
      this.selectedProp4 = "vol"
      this.p5 = "LV_AA.flow"
      this.selectedModel5 = "LV_AA"
      this.selectedProp5 = "flow"
      this.p6 = "LA_LV.flow"
      this.selectedModel6 = "LA_LV"
      this.selectedProp6 = "flow"
      this.p7 = "LA.vol"
      this.selectedModel7 = "LA"
      this.selectedProp7 = "vol"
    },
    toggleFactors() {
      if (!this.scaling) {
        this.chart1_factor = 1.0
        this.chart2_factor = 1.0
        this.chart3_factor = 1.0
        this.chart4_factor = 1000.0
        this.chart5_factor = 1000.0
        this.chart6_factor = 1000.0
        this.chart7_factor = 1000.0
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

      this.p4_max = 0.0
      this.p4_min = 0.0
      this.p4_sd = 0.0
      this.p4_mean = 0.0
      this.p4_permin = 0.0
      this.p4_perbeat = 0.0

      this.p5_max = 0.0
      this.p5_min = 0.0
      this.p5_sd = 0.0
      this.p5_mean = 0.0
      this.p5_permin = 0.0
      this.p5_perbeat = 0.0

      this.p6_max = 0.0
      this.p6_min = 0.0
      this.p6_sd = 0.0
      this.p6_mean = 0.0
      this.p6_permin = 0.0
      this.p6_perbeat = 0.0

      this.p7_max = 0.0
      this.p7_min = 0.0
      this.p7_sd = 0.0
      this.p7_mean = 0.0
      this.p7_permin = 0.0
      this.p7_perbeat = 0.0

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

      if (this.p4 !== '') {
        this.p4_max = Stat.max(this.y4_axis).toFixed(4)
        this.p4_min = Stat.min(this.y4_axis).toFixed(4)
        this.p4_sd = Stat.standardDeviation(this.y4_axis).toFixed(4)
        this.p4_mean = Stat.mean(this.y4_axis).toFixed(4)
        this.p4_permin = Stat.sum(this.y4_axis).toFixed(4)
        this.p4_perbeat = 0.0
      }

      if (this.p5 !== '') {
        this.p5_max = Stat.max(this.y5_axis).toFixed(4)
        this.p5_min = Stat.min(this.y5_axis).toFixed(4)
        this.p5_sd = Stat.standardDeviation(this.y5_axis).toFixed(4)
        this.p5_mean = Stat.mean(this.y5_axis).toFixed(4)
        this.p5_permin = Stat.sum(this.y5_axis).toFixed(4)
        this.p5_perbeat = 0.0
      }

      if (this.p6 !== '') {
        this.p6_max = Stat.max(this.y6_axis).toFixed(4)
        this.p4_min = Stat.min(this.y6_axis).toFixed(4)
        this.p6_sd = Stat.standardDeviation(this.y6_axis).toFixed(4)
        this.p6_mean = Stat.mean(this.y6_axis).toFixed(4)
        this.p6_permin = Stat.sum(this.y6_axis).toFixed(4)
        this.p6_perbeat = 0.0
      }

      if (this.p7 !== '') {
        this.p7_max = Stat.max(this.y7_axis).toFixed(4)
        this.p7_min = Stat.min(this.y7_axis).toFixed(4)
        this.p7_sd = Stat.standardDeviation(this.y7_axis).toFixed(4)
        this.p7_mean = Stat.mean(this.y7_axis).toFixed(4)
        this.p7_permin = Stat.sum(this.y7_axis).toFixed(4)
        this.p7_perbeat = 0.0
      }

    },
    analyzeData() {

      this.resetAnalysis()

      let param1 = []
      let param2 = []
      let param3 = []
      let param4 = []
      let param5 = []
      let param6 = []
      let param7 = []


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

      if (this.p4 !== '') {
        param4 = explain.modelData.map((item) => { return item[this.p4] * this.chart4_factor; });
        this.p4_max = Stat.max(param4).toFixed(4)
        this.p4_min = Stat.min(param4).toFixed(4)
        this.p4_sd = Stat.standardDeviation(param4).toFixed(4)
        this.p4_mean = Stat.sum(param4).toFixed(4)
        this.p4_permin = 0.0
        this.p4_perbeat = 0.0
      }

      if (this.p5 !== '') {
        param5 = explain.modelData.map((item) => { return item[this.p5] * this.chart5_factor; });
        this.p5_max = Stat.max(param5).toFixed(4)
        this.p5_min = Stat.min(param5).toFixed(4)
        this.p5_sd = Stat.standardDeviation(param5).toFixed(4)
        this.p5_mean = Stat.sum(param5).toFixed(4)
        this.p5_permin = 0.0
        this.p5_perbeat = 0.0
      }

      if (this.p6 !== '') {
        param6 = explain.modelData.map((item) => { return item[this.p6] * this.chart6_factor; });
        this.p6_max = Stat.max(param6).toFixed(4)
        this.p6_min = Stat.min(param6).toFixed(4)
        this.p6_sd = Stat.standardDeviation(param6).toFixed(4)
        this.p6_mean = Stat.sum(param6).toFixed(4)
        this.p6_permin = 0.0
        this.p6_perbeat = 0.0
      }

      if (this.p7 !== '') {
        param7 = explain.modelData.map((item) => { return item[this.p7] * this.chart7_factor; });
        this.p7_max = Stat.max(param7).toFixed(4)
        this.p7_min = Stat.min(param7).toFixed(4)
        this.p7_sd = Stat.standardDeviation(param7).toFixed(4)
        this.p7_mean = Stat.sum(param7).toFixed(4)
        this.p7_permin = 0.0
        this.p7_perbeat = 0.0
      }



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
    dataUpdateRt() {
      if (this.alive && !this.show_loops) {
        // update is every 0.015 ms and the data is sampled with 0.005 ms resolution (so 3 data points per 0.015 sec = 200 datapoints per second)
        for (let i = 0; i < explain.modelData.length; i++) {
          this.y1_axis.push(explain.modelData[i][this.p1] * this.chart1_factor)
          this.y2_axis.push(explain.modelData[i][this.p2] * this.chart2_factor)
          this.y3_axis.push(explain.modelData[i][this.p3] * this.chart3_factor)
          this.y4_axis.push(explain.modelData[i][this.p4] * this.chart4_factor)
          this.y5_axis.push(explain.modelData[i][this.p5] * this.chart5_factor)
          this.y6_axis.push(explain.modelData[i][this.p6] * this.chart6_factor)
          this.y7_axis.push(explain.modelData[i][this.p7] * this.chart7_factor)
          this.x_axis.push(this.seconds)
          this.seconds += 0.005;
        }

        if (this.x_axis.length > this.rtWindowValidated * 200.0) {
          let too_many = this.x_axis.length - (this.rtWindowValidated * 200.0)
          this.x_axis.splice(0, too_many)
          this.y1_axis.splice(0, too_many)
          this.y2_axis.splice(0, too_many)
          this.y3_axis.splice(0, too_many)
          this.y4_axis.splice(0, too_many)
          this.y5_axis.splice(0, too_many)
          this.y6_axis.splice(0, too_many)
          this.y7_axis.splice(0, too_many)
        }

        if (this.redrawTimer > this.redrawInterval) {
          this.redrawTimer = 0;
          const myChartPres = this.$refs.myChartPres.chart
          const myChartFlow = this.$refs.myChartFlow.chart
          const myChartVol = this.$refs.myChartVol.chart

          myChartPres.data.labels = this.x_axis
          myChartPres.data.datasets[0].data = [...this.y1_axis]
          myChartPres.data.datasets[0].borderColor = this.p1_color
          myChartPres.data.datasets[1].data = [...this.y2_axis]
          myChartPres.data.datasets[1].borderColor = this.p2_color
          myChartPres.data.datasets[2].data = [...this.y3_axis]
          myChartPres.data.datasets[2].borderColor = this.p3_color

          myChartFlow.data.labels = this.x_axis
          myChartFlow.data.datasets[0].data = [...this.y5_axis]
          myChartFlow.data.datasets[0].borderColor = this.p5_color
          myChartFlow.data.datasets[1].data = [...this.y6_axis]
          myChartFlow.data.datasets[1].borderColor = this.p6_color

          myChartVol.data.labels = this.x_axis
          myChartVol.data.datasets[0].data = [...this.y4_axis]
          myChartVol.data.datasets[0].borderColor = this.p4_color
          myChartVol.data.datasets[1].data = [...this.y7_axis]
          myChartVol.data.datasets[1].borderColor = this.p7_color


          requestAnimationFrame(() => {
            myChartPres.update()
            myChartFlow.update()
            myChartVol.update()
          })


          if (this.show_summary) {
            this.analyzeDataRt()
          }

        }
        this.redrawTimer += 0.015
      }
    },
    toggleSummary() {
      if (this.show_summary) {
        this.analyzeData()
      }

    },
    dataUpdate() {

      let data_set_pres = []
      if (this.p1 !== '') {
        this.y1_axis = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
        data_set_pres.push({
          data: this.y1_axis,
          borderColor: this.p1_color,
          borderWidth: 1,
          pointStyle: false
        })
      }

      if (this.p2 !== '') {
        this.y2_axis = explain.modelData.map((item) => { return item[this.p2] * this.chart2_factor; });
        data_set_pres.push({
          data: this.y2_axis,
          borderColor: this.p2_color,
          borderWidth: 1,
          pointStyle: false
        })
      }

      if (this.p3 !== '') {
        this.y3_axis = explain.modelData.map((item) => { return item[this.p3] * this.chart3_factor; });
        data_set_pres.push({
          data: this.y3_axis,
          borderColor: this.p3_color,
          borderWidth: 1,
          pointStyle: false
        })
      }


      let data_set_flow = []
      if (this.p5 !== '') {
        this.y5_axis = explain.modelData.map((item) => { return item[this.p5] * this.chart5_factor; });
        data_set_flow.push({
          data: this.y5_axis,
          borderColor: this.p5_color,
          borderWidth: 1,
          pointStyle: false
        })
      }
      if (this.p6 !== '') {
        this.y6_axis = explain.modelData.map((item) => { return item[this.p6] * this.chart6_factor; });
        data_set_flow.push({
          data: this.y6_axis,
          borderColor: this.p6_color,
          borderWidth: 1,
          pointStyle: false
        })
      }



      let data_set_vol = []
      if (this.p4 !== '') {
        this.y4_axis = explain.modelData.map((item) => { return item[this.p4] * this.chart4_factor; });
        data_set_vol.push({
          data: this.y4_axis,
          borderColor: this.p4_color,
          borderWidth: 1,
          pointStyle: false
        })
      }

      if (this.p7 !== '') {
        this.y7_axis = explain.modelData.map((item) => { return item[this.p7] * this.chart7_factor; });
        data_set_vol.push({
          data: this.y7_axis,
          borderColor: this.p7_color,
          borderWidth: 1,
          pointStyle: false
        })
      }


      this.x_axis = [...Array(this.y1_axis.length).keys()]

      this.chartDataPres = {
        labels: this.x_axis,
        datasets: [...data_set_pres]
      }
      this.chartDataFlow = {
        labels: this.x_axis,
        datasets: [...data_set_flow]
      }
      this.chartDataVol = {
        labels: this.x_axis,
        datasets: [...data_set_vol]
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
      this.y4_axis = []
      this.y5_axis = []
      this.y6_axis = []
      this.y7_axis = []


    },
    exportData() {
      let header = ""
      let data = {
        time: explain.modelData.map((item) => { return item['time'] }),
      }


      if (this.p1 !== "") {
        let h1 = this.selectedModel1.toUpperCase() + this.selectedProp1.toUpperCase() + "_";
        header += h1
        data[h1] = explain.modelData.map((item) => { return (parseFloat(item[this.p1])).toFixed(5) });
      }
      if (this.p2 !== "") {
        let h2 = this.selectedModel2.toUpperCase() + this.selectedProp2.toUpperCase() + "_";
        header += h2
        data[h2] = explain.modelData.map((item) => { return (parseFloat(item[this.p2])).toFixed(5) });
      }
      if (this.p3 !== "") {
        let h3 = this.selectedModel3.toUpperCase() + this.selectedProp3.toUpperCase();
        header += h3
        data[h3] = explain.modelData.map((item) => { return (parseFloat(item[this.p3])).toFixed(5) });
      }
      if (this.p4 !== "") {
        let h4 = this.selectedModel4.toUpperCase() + this.selectedProp4.toUpperCase();
        header += h4
        data[h4] = explain.modelData.map((item) => { return (parseFloat(item[this.p4])).toFixed(5) });
      }
      if (this.p5 !== "") {
        let h5 = this.selectedModel5.toUpperCase() + this.selectedProp5.toUpperCase();
        header += h5
        data[h5] = explain.modelData.map((item) => { return (parseFloat(item[this.p5])).toFixed(5) });
      }
      if (this.p6 !== "") {
        let h6 = this.selectedModel6.toUpperCase() + this.selectedProp6.toUpperCase();
        header += h6
        data[h6] = explain.modelData.map((item) => { return (parseFloat(item[this.p6])).toFixed(5) });
      }
      if (this.p7 !== "") {
        let h7 = this.selectedModel7.toUpperCase() + this.selectedProp7.toUpperCase();
        header += h7
        data[h7] = explain.modelData.map((item) => { return (parseFloat(item[this.p7])).toFixed(5) });
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
    },
    processModelState() {
      if (explain.modelState.models) {
      }
    }
  },
  mounted() {
    this.$bus.on("rtf", () => this.dataUpdateRt());
    this.$bus.on("data", () => this.dataUpdate())
    this.$bus.on("state", this.processModelState)
    explain.watchModelProps(["LV.pres", "LV.vol", "LA.pres", "LA.vol", "AA.pres", "LA_LV.flow", "LV_AA.flow", "RV.pres", "RV.vol", "RA.pres", "RA.vol", "PA.pres", "RA_RV.flow", "RV_PA.flow"])

    // check whether hires is enabled
    this.toggleHires()
  },
};
</script>

<style></style>
