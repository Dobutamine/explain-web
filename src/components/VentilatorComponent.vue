<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="q-mt-es row gutter text-overline justify-center"
      @click="isEnabled = !isEnabled"
    >
      {{ title }}
    </div>


    <!-- chart -->
    <div v-if="!show_loops">
    <div class="q-mt-sm row text-overline justify-center">pressure (cmh2o)</div>
      <Line v-if="isEnabled && !show_loops"
          id="my-chart-vent-pres"
          :options="chartOptionsPres"
          :data="chartDataPres"
          style="max-height: 100px;"
      />
      <div class="row text-overline justify-center">flow (l/min)</div>
      <Line v-if="isEnabled && !show_loops"
          id="my-chart-vent-flow"
          :options="chartOptionsFlow"
          :data="chartDataFlow"
          style="max-height: 100px;"
      />
      <div class="row text-overline justify-center">volume (ml)</div>
      <Line v-if="isEnabled"
          id="my-chart-vent-vol"
          :options="chartOptionsVol"
          :data="chartDataVol"
          style="max-height: 100px;"
      />
    </div>

    <XYChartComponent v-if="isEnabled && show_loops" :alive="show_loops" title="" :presets="presets_loops" :load-preset="true"></XYChartComponent>

    <div v-if="isEnabled"
        class="q-mt-sm text-overline justify-center q-gutter-xs row"
      >
      <div>
        <q-btn-toggle
          v-model="mode"
          color="grey-9"
          size="sm"
          text-color="white"
          toggle-color="primary"
          :options="[
            {label: 'OFF', value: 'OFF'},
            {label: 'PC', value: 'PC'},
            {label: 'PRVC', value: 'PRVC'},
            {label: 'PS', value: 'PS'},
            {label: 'VC', value: 'VC'},
          ]"
          @update:model-value="update_ventilator_setttings"
        />

      </div>


      <div>
      <q-btn-toggle
      class="q-ml-sm"
          v-model="show_loops"
          color="grey-9"
          size="sm"
          text-color="white"
          toggle-color="primary"
          :options="[
            {label: 'CURVES', value: false},
            {label: 'LOOPS', value: true},
          ]"
        />
      </div>
      <div>
        <q-toggle
        v-model="spont_breathing"
        size="sm"
        label="breathing"
        @update:model-value="toggle_spont_breathing"
      />
      </div>
      <div>
        <q-input
                v-if="!show_loops"
                class="q-ml-sm q-pb-lg"
                v-model.number="rtWindow"
                type="number"
                label="time"
                filled
                dense
                min="1"
                max="30"
                hide-bottom-space
                @update:model-value="updateRtWindow"
              />
      </div>
    </div>
    <!-- ventilator controls -->

    <div v-if="isEnabled && ventilator_running"
        class="text-overline justify-center q-gutter-sm row"
      >
        <div class="q-mr-sm text-center">
          <div>{{ pip_caption}}</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="pip_cmh2o"
              size="50px"
              :min="0"
              :max="50"
              :step="1"
              :thickness="0.22"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="update_ventilator_setttings"
            >
              {{ pip_cmh2o }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">cmh2o</div>
        </div>
        <div class="q-mr-sm text-center">
          <div>peep</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="peep_cmh2o"
              size="50px"
              :min="0"
              :max="20"
              :step="1"
              :thickness="0.22"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="update_ventilator_setttings"
            >
              {{ peep_cmh2o }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">cmH2O</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">t insp</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="insp_time"
              size="50px"
              :min="0.1"
              :max="2.0"
              :step="0.05"
              :thickness="0.22"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="update_ventilator_setttings"
            >
              {{ insp_time }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">sec</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">freq</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="freq"
              :min="0"
              :max="70"
              :step="1"
              size="50px"
              :thickness="0.22"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="update_ventilator_setttings"
            >
              {{ freq }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">/min</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">flow</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="insp_flow"
              size="50px"
              :thickness="0.22"
              :min="0"
              :max="20"
              :step="1"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="update_ventilator_setttings"
            >
              {{ insp_flow }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">l/min</div>
        </div>
        <div v-if="mode =='PRVC' || mode == 'VC'" class="q-mr-sm text-center">
          <div class="knob-label">tv</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="tidal_volume"
              size="50px"
              :thickness="0.22"
              :min="1"
              :max="50"
              :step="1"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="update_ventilator_setttings"
            >
              {{ tidal_volume }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">ml</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">fio2</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="fio2"
              size="50px"
              :thickness="0.22"
              :min="21"
              :max="100"
              :step="1"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="set_fio2"
            >
              {{ fio2 }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">%</div>
        </div>
        <div class="q-mr-sm text-center">
          <div class="knob-label">trigger</div>
            <q-knob
              show-value
              font-size="12px"
              v-model="trigger_perc"
              size="50px"
              :thickness="0.22"
              :min="1"
              :max="50"
              :step="1"
              color="teal"
              track-color="grey-3"
              class="col"
              @update:model-value="set_trigger"
            >
              {{ trigger_perc }}
            </q-knob>
            <div :style="{ fontSize: '10px' }">%</div>
        </div>
      </div>
    <div v-if="isEnabled" class="text-overline justify-center q-gutter-xs row">
    </div>

  </q-card>
</template>

<script>
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { ref } from 'vue'
import * as Stat from "simple-statistics";
import XYChartComponent from "./XYChartComponent.vue";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)
export default {
  setup() {
    // make the chartdata reactive
    let chartDataPres = ref({
        labels: [],
        backgroundColor: '#888888',
        datasets: [ { data: [] } ]
      })
    let chartDataFlow = ref({
        labels: [],
        backgroundColor: '#888888',
        datasets: [ { data: [] } ]
      })
    let chartDataVol = ref({
        labels: [],
        backgroundColor: '#888888',
        datasets: [ { data: [] } ]
      })

      let chartOptionsPres = ref({
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
      let chartOptionsFlow = ref({
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
      let chartOptionsVol = ref({
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
      chartDataPres,
      chartDataFlow,
      chartDataVol,
      chartOptionsPres,
      chartOptionsFlow,
      chartOptionsVol

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
      rtWindow: 5,
      rtWindowValidated: 5,
      analysisEnabled: true,
      autoscaleEnabled: true,
      autoscale: true,
      loopMode: false,
      isEnabled: true,
      pip_caption: "pip",
      pip_cmh2o: 14.0,
      peep_cmh2o: 4.0,
      freq: 40,
      insp_time: 0.4,
      insp_flow: 8.0,
      tidal_volume: 15,
      fio2: 21,
      trigger_perc: 6.0,
      mode: "OFF",
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
      title: "MECHANICAL VENTILATOR",
      selectedModel1: "Ventilator",
      selectedProp1: "pres",
      p1: "Ventilator.pres",
      p1_max: 0.0,
      p1_min: 0.0,
      p1_sd: 0.0,
      p1_mean: 0.0,
      p1_permin: 0.0,
      p1_perbeat: 0.0,
      selectedModel2: "Ventilator",
      selectedProp2: "flow",
      p2: "Ventilator.flow",
      p2_max: 0.0,
      p2_min: 0.0,
      p2_sd: 0.0,
      p2_mean: 0.0,
      p2_permin: 0.0,
      p2_perbeat: 0.0,
      selectedModel3: "Ventilator",
      selectedProp3: "vol",
      p3: "Ventilator.vol",
      p3_max: 0.0,
      p3_min: 0.0,
      p3_sd: 0.0,
      p3_mean: 0.0,
      p3_permin: 0.0,
      p3_perbeat: 0.0,
      seconds: 0,
      x_axis: [],
      y1_axis: [],
      y2_axis: [],
      y3_axis: [],
      redrawInterval: 0.03,
      redrawTimer: 0.0,
      debug_mode: true,
      presets: {
        "vent": ["Ventilator.pres"]
      },
      presets_loops: {
        "PV LOOP": ["Ventilator.pres", "Ventilator.vol"],
        "VF LOOP": ["Ventilator.vol", "Ventilator.flow"],
      }
    };
  },
  methods: {
    toggle_spont_breathing() {
      explain.callModelFunction("Breathing.switch_breathing", [this.spont_breathing])
    },
    set_trigger() {
      explain.callModelFunction("Ventilator.set_trigger_perc", [parseFloat[this.trigger_perc]])
    },
    set_fio2() {
      explain.callModelFunction("Ventilator.set_fio2", [parseFloat(this.fio2)])
    },
    update_ventilator_setttings() {
      switch (this.mode) {
        case "OFF":
          this.ventilator_running = false
          this.spont_breathing = true
          this.toggle_spont_breathing()
          explain.callModelFunction("Ventilator.switch_ventilator", [false])
          break;
        case "PC":
          if (!this.ventilator_running) {
            this.ventilator_running = true;
            explain.callModelFunction("Ventilator.switch_ventilator", [true])
          }
          if (this.ventilator_running) {
            explain.callModelFunction("Ventilator.set_ventilator_pc", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.insp_time, this.insp_flow])
          }
          this.spont_breathing = false
          this.toggle_spont_breathing()
          break;
        case "PRVC":
          if (!this.ventilator_running) {
            this.ventilator_running = true;
            explain.callModelFunction("Ventilator.switch_ventilator", [true])
          }
          if (this.ventilator_running) {
            this.pip_caption = "pip max"
            explain.callModelFunction("Ventilator.set_ventilator_prvc", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.tidal_volume, this.insp_time, this.insp_flow])
            }
            this.spont_breathing = false
          this.toggle_spont_breathing()
          break;
        case "PS":
          if (!this.ventilator_running) {
            this.ventilator_running = true;
            explain.callModelFunction("Ventilator.switch_ventilator", [true])
          }
          if (this.ventilator_running) {
            explain.callModelFunction("Ventilator.set_ventilator_ps", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.insp_time, this.insp_flow])
          }
          break;
        case "VC":
          if (!this.ventilator_running) {
            this.ventilator_running = true;
            explain.callModelFunction("Ventilator.switch_ventilator", [true])
          }
          if (this.ventilator_running) {
            this.pip_caption = "pip max"
            explain.callModelFunction("Ventilator.set_ventilator_vc", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.tidal_volume, this.insp_time, this.insp_flow])
          }
          this.spont_breathing = false
          this.toggle_spont_breathing()
          break;

      }
    },
    switch_vent() {
      explain.callModelFunction("Ventilator.switch_ventilator", [true])
    },
    clearProps() {
      this.p1 = "Ventilator.pres"
      this.selectedModel1 = "Ventilator"
      this.selectedProp1 = "pres"
      this.p2 = "Ventilator.flow"
      this.selectedModel2 = "Ventilator"
      this.selectedProp2 = "flow"
      this.p3 = "Ventilator.flow"
      this.selectedModel3 = "Ventilator"
      this.selectedProp3 = "flow"
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
        param1 = explain.modelData.map((item) => {return item[this.p1] * this.chart1_factor;});
        this.p1_max = Stat.max(param1).toFixed(4)
        this.p1_min = Stat.min(param1).toFixed(4)
        this.p1_sd = Stat.standardDeviation(param1).toFixed(4)
        this.p1_mean = Stat.mean(param1).toFixed(4)
        this.p1_permin = Stat.sum(param1).toFixed(4)
        this.p1_perbeat = 0.0
      }

      if (this.p2 !== '') {
        param2 = explain.modelData.map((item) => {return item[this.p2] * this.chart2_factor;});
        this.p2_max = Stat.max(param2).toFixed(4)
        this.p2_min = Stat.min(param2).toFixed(4)
        this.p2_sd = Stat.standardDeviation(param2).toFixed(4)
        this.p2_mean = Stat.mean(param2).toFixed(4)
        this.p2_permin = Stat.sum(param2).toFixed(4)
        this.p2_perbeat = 0.0
      }

      if (this.p3 !== '') {
        param3 = explain.modelData.map((item) => {return item[this.p3] * this.chart3_factor;});
        this.p3_max = Stat.max(param3).toFixed(4)
        this.p3_min = Stat.min(param3).toFixed(4)
        this.p3_sd = Stat.standardDeviation(param3).toFixed(4)
        this.p3_mean = Stat.sum(param3).toFixed(4)
        this.p3_permin = 0.0
        this.p3_perbeat = 0.0
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
      if (this.alive) {
        // update is every 0.015 ms and the data is sampled with 0.005 ms resolution (so 3 data points per 0.015 sec = 200 datapoints per second)
        for (let i=0; i < explain.modelData.length; i++) {
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
          this.chartDataPres = {
            labels: this.x_axis,
            datasets: [ {
              data: [...this.y1_axis],
              borderColor: 'rgb(192, 0, 0)',
              borderWidth: 1,
              pointStyle: false
            }]
          }
          this.chartDataFlow = {
            labels: this.x_axis,
            datasets: [ {
              data: [...this.y2_axis],
              borderColor: 'rgb(0, 192, 0)',
              borderWidth: 1,
              pointStyle: false
            }]
          }
          this.chartDataVol = {
            labels: this.x_axis,
            datasets: [ {
              data: [...this.y3_axis],
              borderColor: 'rgb(0, 192, 192)',
              borderWidth: 1,
              pointStyle: false
            } ]
          }

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

      let data_set_pres = {}
      if (this.p1 !== '') {
        this.y1_axis = explain.modelData.map((item) => {return item[this.p1] * this.chart1_factor;});
        data_set_pres = {
              data: this.y1_axis,
              borderColor: 'rgb(192, 0, 0)',
              borderWidth: 1,
              pointStyle: false
            }
      }

      let data_set_flow = {}
      if (this.p2 !== '') {
        this.y2_axis = explain.modelData.map((item) => {return item[this.p2] * this.chart2_factor;});
        data_set_flow = {
              data: this.y2_axis,
              borderColor: 'rgb(0, 192, 0)',
              borderWidth: 1,
              pointStyle: false
            };
      }

      let data_set_vol = {}
      if (this.p3 !== '') {
        this.y3_axis = explain.modelData.map((item) => {return item[this.p3] * this.chart3_factor;});
        data_set_vol = {
              data: this.y3_axis,
              borderColor: 'rgb(0, 192, 192)',
              borderWidth: 1,
              pointStyle: false
            };
      }

      this.x_axis = [...Array(this.y1_axis.length).keys()]

      this.chartDataPres = {
            labels: this.x_axis,
            datasets: [data_set_pres]
      }
      this.chartDataFlow = {
            labels: this.x_axis,
            datasets: [data_set_flow]
      }
      this.chartDataVol = {
            labels: this.x_axis,
            datasets: [data_set_vol]
      }



      if (this.show_summary)
      {
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
        time: explain.modelData.map((item) => {return item['time']}),
      }


      if (this.p1 !== "") {
        let h1 = this.selectedModel1.toUpperCase() + this.selectedProp1.toUpperCase() + "_";
        header += h1
        data[h1] = explain.modelData.map((item) => {return (parseFloat(item[this.p1])).toFixed(5)});
      }
      if (this.p2 !== "") {
        let h2 = this.selectedModel2.toUpperCase() + this.selectedProp2.toUpperCase() + "_";
        header += h2
        data[h2] = explain.modelData.map((item) => {return (parseFloat(item[this.p2])).toFixed(5)});
      }
      if (this.p3 !== "") {
        let h3 = this.selectedModel3.toUpperCase() + this.selectedProp3.toUpperCase();
        header += h3
        data[h3] = explain.modelData.map((item) => {return (parseFloat(item[this.p3])).toFixed(5)});
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
  beforeRouteLeave() {
    console.log('unrouted')
  },
  beforeUnmount() {
    console.log('unmonuted')
  },
  mounted() {
    // get the realtime slow data
    this.$bus.on("rtf", () => {
      this.dataUpdateRt()
    });

    // this.$bus.on("state", this.processAvailableModels)
    this.$bus.on("data", () => this.dataUpdate())

    explain.watchModelProps(["Ventilator.pres", "Ventilator.flow", "Ventilator.vol", "Ventilator.co2", "Ventilator.etco2"])

  },
};
</script>

<style></style>
