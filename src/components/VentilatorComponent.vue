<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>


    <!-- chart -->
    <div v-if="!show_loops">
      <div class="q-mt-sm row text-overline justify-center">pressure (cmh2o)</div>
      <Line v-if="isEnabled && !show_loops" ref="myTest" id="my-chart-vent-pres" :options="chartOptions"
        :data="chartData" style="max-height: 250px;" />
      <!-- <div class="row text-overline justify-center">flow (l/min)</div> -->
      <!-- <Line v-if="isEnabled && !show_loops" id="my-chart-vent-flow" :options="chartOptionsFlow" :data="chartDataFlow"
        style="max-height: 100px;" />
      <div class="row text-overline justify-center">volume (ml)</div>
      <Line v-if="isEnabled" id="my-chart-vent-vol" :options="chartOptionsVol" :data="chartDataVol"
        style="max-height: 100px;" /> -->
    </div>

    <XYChartComponent v-if="isEnabled && show_loops" :alive="show_loops" title="" :presets="presets_loops"
      :load-preset="true"></XYChartComponent>

    <div v-if="isEnabled" class="q-mt-sm text-overline justify-center q-gutter-xs row">
      <div>
        <q-btn-toggle v-model="mode" color="grey-9" size="sm" text-color="white" toggle-color="primary" :options="[
          { label: 'OFF', value: 'OFF' },
          { label: 'PC', value: 'PC' },
          { label: 'PRVC', value: 'PRVC' },
          { label: 'PS', value: 'PS' },
          { label: 'VC', value: 'VC' },
          { label: 'HFOV', value: 'HFOV' },
        ]" @update:model-value="update_ventilator_setttings" />

      </div>


      <div>
        <q-btn-toggle class="q-ml-sm" v-model="show_loops" color="grey-9" size="sm" text-color="white"
          toggle-color="primary" :options="[
            { label: 'CURVES', value: false },
            { label: 'LOOPS', value: true },
          ]" />
      </div>
      <div>
        <q-btn-toggle class="q-ml-sm" v-model="curve_param" color="grey-9" size="sm" text-color="white"
          toggle-color="primary" :options="[
            { label: 'PRES', value: 'pres' },
            { label: 'FLOW', value: 'flow' },
            { label: 'VOL', value: 'vol' },
          ]" @update:model-value="toggleCurveParam" />
      </div>

    </div>
    <div v-if="isEnabled" class="q-mt-sm text-overline justify-center q-gutter-xs row">
      <div>
        <q-toggle v-model="spont_breathing" size="sm" label="breathing" @update:model-value="toggle_spont_breathing" />
      </div>
      <div>
        <q-toggle class="q-ml-sm q-pb-lg" v-model="state.configuration.chart_hires" label="hi-res" dense size="sm"
          @update:model-value="toggleHires" />
      </div>
      <div>
        <q-input v-if="!show_loops && !state.configuration.chart_hires" class="q-ml-sm q-pb-lg"
          v-model.number="rtWindow" type="number" label="time" filled dense min="1" max="30" hide-bottom-space
          @update:model-value="updateRtWindow" />
      </div>
    </div>
    <!-- ventilator controls -->

    <div v-if="isEnabled && ventilator_running" class="text-overline justify-center q-gutter-sm row">
      <div v-if="mode != 'HFOV'" class="q-mr-sm text-center">
        <div>{{ pip_caption }}</div>
        <q-knob show-value font-size="12px" v-model="pip_cmh2o" size="50px" :min="0" :max="50" :step="1"
          :thickness="0.22" color="teal" track-color="grey-3" class="col"
          @update:model-value="update_ventilator_setttings">
          {{ pip_cmh2o }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">cmh2o</div>
      </div>
      <div v-if="mode != 'HFOV'" class="q-mr-sm text-center">
        <div>peep</div>
        <q-knob show-value font-size="12px" v-model="peep_cmh2o" size="50px" :min="0" :max="20" :step="1"
          :thickness="0.22" color="teal" track-color="grey-3" class="col"
          @update:model-value="update_ventilator_setttings">
          {{ peep_cmh2o }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">cmH2O</div>
      </div>
      <div v-if="mode != 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">t insp</div>
        <q-knob show-value font-size="12px" v-model="insp_time" size="50px" :min="0.1" :max="2.0" :step="0.05"
          :thickness="0.22" color="teal" track-color="grey-3" class="col"
          @update:model-value="update_ventilator_setttings">
          {{ insp_time }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">sec</div>
      </div>
      <div v-if="mode != 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">freq</div>
        <q-knob show-value font-size="12px" v-model="freq" :min="0" :max="70" :step="1" size="50px" :thickness="0.22"
          color="teal" track-color="grey-3" class="col" @update:model-value="update_ventilator_setttings">
          {{ freq }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">/min</div>
      </div>
      <div v-if="mode != 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">flow</div>
        <q-knob show-value font-size="12px" v-model="insp_flow" size="50px" :thickness="0.22" :min="0" :max="20"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_ventilator_setttings">
          {{ insp_flow }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">l/min</div>
      </div>
      <div v-if="(mode == 'PRVC' || mode == 'VC') && mode != 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">tv</div>
        <q-knob show-value font-size="12px" v-model="tidal_volume" size="50px" :thickness="0.22" :min="1" :max="50"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_ventilator_setttings">
          {{ tidal_volume }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">ml</div>
      </div>

      <div v-if="mode == 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">map</div>
        <q-knob show-value font-size="12px" v-model="hfo_map_cmh2o" size="50px" :thickness="0.22" :min="5" :max="50"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_hfo">
          {{ hfo_map_cmh2o }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">cmh2o</div>
      </div>

      <div v-if="mode == 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">freq</div>
        <q-knob show-value font-size="12px" v-model="hfo_freq" size="50px" :thickness="0.22" :min="1" :max="15"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_hfo">
          {{ hfo_freq }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">hz</div>
      </div>

      <div v-if="mode == 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">amplitude</div>
        <q-knob show-value font-size="12px" v-model="hfo_amplitude_cmh2o" size="50px" :thickness="0.22" :min="0"
          :max="75" :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_hfo">
          {{ hfo_amplitude_cmh2o }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">cmh2o</div>
      </div>

      <div v-if="mode == 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">bias flow</div>
        <q-knob show-value font-size="12px" v-model="hfo_bias_flow" size="50px" :thickness="0.22" :min="1" :max="20"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_hfo">
          {{ hfo_bias_flow }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">l/min</div>
      </div>


      <div class="q-mr-sm text-center">
        <div class="knob-label">fio2</div>
        <q-knob show-value font-size="12px" v-model="fio2" size="50px" :thickness="0.22" :min="21" :max="100" :step="1"
          color="teal" track-color="grey-3" class="col" @update:model-value="set_fio2">
          {{ fio2 }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">%</div>
      </div>
      <div v-if="mode != 'HFOV'" class="q-mr-sm text-center">
        <div class="knob-label">trigger</div>
        <q-knob show-value font-size="12px" v-model="trigger_perc" size="50px" :thickness="0.22" :min="1" :max="50"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="set_trigger">
          {{ trigger_perc }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">%</div>
      </div>



    </div>


    <div v-if="isEnabled && ventilator_running" class="q-mt-md q-mb-md text-overline justify-center q-gutter-xs row">
      <q-input v-model="et_tube_diameter" @update:model-value="set_ettube_diameter" color="blue" hide-hint filled
        label="et tube diameter (mm)" :min="2.0" :max="5.0" :step="0.5" dense stack-label type="number"
        style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>

      </q-input>
      <q-input v-model="et_tube_length" @update:model-value="set_ettube_length" color="blue" hide-hint filled
        label="et tube length (mm)" :min="50" :max="110" :step="5" dense stack-label type="number"
        style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>
      </q-input>
      <q-input v-model="temp" @update:model-value="set_temp" color="blue" hide-hint filled label="temperature (C)"
        :min="0" :max="60" :step="0.1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
        class="q-mr-sm text-center" squared>
      </q-input>
      <q-input v-model="humidity" @update:model-value="set_humidity" color="blue" hide-hint filled label="humidity (%)"
        :min="0" :max="100" :step="1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
        class="q-mr-sm text-center" squared>
      </q-input>


    </div>


  </q-card>
</template>

<script>
import { useStateStore } from "src/stores/state";
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { shallowRef } from 'vue'
import * as Stat from "simple-statistics";
import XYChartComponent from "./XYChartComponent.vue";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)
export default {
  setup() {
    const state = useStateStore()

    // make the chartdata reactive
    let chartData = shallowRef({
      labels: [],
      backgroundColor: '#888888',
      datasets: [{
        data: [],
        borderColor: 'rgb(192, 0, 0)',
        borderWidth: 2,
        pointStyle: false
      }],
    })

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
      chartData,
      chartOptions
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
      mode: "OFF",
      x_min: 2,
      x_max: 15.0,
      y_min: 0,
      y_max: 25,
      multipliersEnabled: true,
      scaling: false,
      chart1_factor: 1.0,
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
      seconds: 0,
      x_axis: [],
      y1_axis: [],
      redrawInterval: 0.015,
      redrawTimer: 0.0,
      debug_mode: true,
      presets: {
        "vent": ["Ventilator.pres"]
      },
      presets_loops: {
        "PV LOOP": ["Ventilator.pres", "Ventilator.vol"],
        "VF LOOP": ["Ventilator.vol", "Ventilator.flow"],
        "PV SPONT": ["THORAX.pres", "THORAX.vol"]
      },
      update_model: true,
      curve_param: "pres",
    };
  },
  methods: {
    toggleCurveParam() {
      if (this.curve_param == "pres") {
        this.p1 = "Ventilator.pres"
      }
      if (this.curve_param == "flow") {
        this.p1 = "Ventilator.flow"
      }
      if (this.curve_param == "vol") {
        this.p1 = "Ventilator.vol"
      }

    },
    toggleHires() {
      if (this.state.configuration.chart_hires) {
        this.rtWindow = 1.0
        explain.setSampleInterval(0.0015)
      } else {
        this.rtWindow = 3.0
        explain.setSampleInterval(0.005)
      }
    },
    toggle_spont_breathing() {
      if (this.update_model) {
        explain.callModelFunction("Breathing.switch_breathing", [this.spont_breathing])
      }
    },
    set_ettube_diameter() {
      if (this.update_model) {
        if (this.et_tube_diameter >= 1.5 && this.et_tube_diameter < 10.0) {
          explain.callModelFunction("Ventilator.set_ettube_diameter", [this.et_tube_diameter])
        }
      }
    },
    set_ettube_length() {
      if (this.update_model) {
        if (this.et_tube_length >= 50 && this.et_tube_length < 300) {
          explain.callModelFunction("Ventilator.set_ettube_length", [this.et_tube_length])
        }
      }
    },
    set_trigger() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_trigger_perc", [parseFloat[this.trigger_perc]])
      }
    },
    set_fio2() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_fio2", [parseFloat(this.fio2)])
      }
    },
    set_temp() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_temp", [parseFloat(this.temp)])
      }
    },
    set_humidity() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_humidity", [parseFloat(this.humidity / 100.0)])
      }
    },
    update_hfo() {
      explain.callModelFunction("Ventilator.set_ventilator_hfov", [this.hfo_map_cmh2o, this.hfo_freq, this.hfo_amplitude_cmh2o, this.hfo_bias_flow])
    },
    update_ventilator_setttings() {
      if (this.update_model) {
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
          case "HFOV":
            if (!this.ventilator_running) {
              this.ventilator_running = true;
              explain.callModelFunction("Ventilator.switch_ventilator", [true])
            }
            if (this.ventilator_running) {
              this.pip_caption = "pip max"
              explain.callModelFunction("Ventilator.set_ventilator_hfov", [this.hfo_map_cmh2o, this.hfo_freq, this.hfo_amplitude_cmh2o, this.hfo_bias_flow])

            }
            this.spont_breathing = false
            this.toggle_spont_breathing()

        }
      }
    },
    switch_vent() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.switch_ventilator", [true])
      }
    },
    clearProps() {
      this.p1 = "Ventilator.pres"
      this.selectedModel1 = "Ventilator"
      this.selectedProp1 = "pres"
    },
    toggleFactors() {
      if (!this.scaling) {
        this.chart1_factor = 1.0
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

    },
    analyzeData() {

      this.resetAnalysis()

      let param1 = []


      if (this.p1 !== '') {
        param1 = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
        this.p1_max = Stat.max(param1).toFixed(4)
        this.p1_min = Stat.min(param1).toFixed(4)
        this.p1_sd = Stat.standardDeviation(param1).toFixed(4)
        this.p1_mean = Stat.mean(param1).toFixed(4)
        this.p1_permin = Stat.sum(param1).toFixed(4)
        this.p1_perbeat = 0.0
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
          this.x_axis.push(this.seconds)
          this.seconds += 0.005;
        }

        if (this.x_axis.length > this.rtWindowValidated * 200.0) {
          let too_many = this.x_axis.length - (this.rtWindowValidated * 200.0)
          this.x_axis.splice(0, too_many)
          this.y1_axis.splice(0, too_many)
        }

        if (this.redrawTimer > this.redrawInterval) {

          this.redrawTimer = 0;
          const myChart = this.$refs.myTest.chart
          myChart.data.labels = this.x_axis
          myChart.data.datasets[0].data = [...this.y1_axis]
          requestAnimationFrame(() => {
            myChart.update()
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

      let data_set_pres = {}
      if (this.p1 !== '') {
        this.y1_axis = explain.modelData.map((item) => { return item[this.p1] * this.chart1_factor; });
        data_set_pres = {
          data: this.y1_axis,
          borderColor: 'rgb(192, 0, 0)',
          borderWidth: 1,
          pointStyle: false
        }
      }

      this.x_axis = [...Array(this.y1_axis.length).keys()]

      this.chartData = {
        labels: this.x_axis,
        datasets: [data_set_pres]
      }

      if (this.show_summary) {
        this.analyzeDataRt()
      }
      // prepare for realtime analysis
      this.seconds = 0
      this.x_axis = []
      this.y1_axis = []

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
        this.ventilator_running = explain.modelState.models["Ventilator"].vent_running
        if (this.ventilator_running) {
          this.mode = explain.modelState.models["Ventilator"].vent_mode
          explain.watchModelProps(["Ventilator.pres", "Ventilator.flow", "Ventilator.vol", "Ventilator.co2", "Ventilator.etco2", "Breathing.breathing_enabled"])
        } else {
          this.mode = "OFF"
        }
        this.et_tube_diameter = explain.modelState.models["Ventilator"].ettube_diameter
        this.et_tube_length = explain.modelState.models["Ventilator"].ettube_length
        this.temp = explain.modelState.models["Ventilator"].temp
        this.humidity = explain.modelState.models["Ventilator"].humidity * 100.0
        this.pip_cmh2o = explain.modelState.models["Ventilator"].pip_cmh2o_max
        this.peep_cmh2o = explain.modelState.models["Ventilator"].peep_cmh2o
        this.freq = explain.modelState.models["Ventilator"].vent_rate
        this.insp_time = explain.modelState.models["Ventilator"].insp_time
        this.insp_flow = explain.modelState.models["Ventilator"].insp_flow
        this.tidal_volume = explain.modelState.models["Ventilator"].tidal_volume * 1000.0
        this.fio2 = explain.modelState.models["Ventilator"].fio2 * 100.0
        this.trigger_perc = explain.modelState.models["Ventilator"].trigger_volume_perc
        this.hfo_amplitude_cmh2o = explain.modelState.models["Ventilator"].hfo_amplitude_cmh2o
        this.hfo_map_cmh2o = explain.modelState.models["Ventilator"].hfo_map_cmh2o
        this.hfo_freq = explain.modelState.models["Ventilator"].hfo_freq
        this.hfo_bias_flow = explain.modelState.models["Ventilator"].hfo_bias_flow
        this.spont_breathing = explain.modelState.models["Breathing"].breathing_enabled

      }
    }
  },
  mounted() {
    this.$bus.on("rtf", () => this.dataUpdateRt());
    this.$bus.on("data", () => this.dataUpdate())
    this.$bus.on("state", this.processModelState)
    explain.watchModelProps(["Ventilator.pres", "Ventilator.flow", "Ventilator.vol", "Ventilator.co2", "Ventilator.etco2", "Breathing.breathing_enabled"])

    // check whether hires is enabled
    this.toggleHires()
  },
};
</script>

<style></style>
