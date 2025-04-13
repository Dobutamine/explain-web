<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>
    <div v-if="isEnabled && !loadPreset"
      class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center q-gutter-xs row">
      <q-select label-color="red" class="q-pa-xs col" v-model="selectedModel1" square label="model x" hide-hint
        :options="modelNames" dense dark stack-label @update:model-value="selectModel1" />
      <q-select v-if="selectedModel1 !== ''" label-color="red" class="q-pa-xs col" v-model="selectedProp1" square
        label="prop x" hide-hint :options="prop1Names" dense dark stack-label @update:model-value="selectProp1" />
      <q-select label-color="green" class="q-pa-xs col" v-model="selectedModel2" square label="model y" hide-hint
        :options="modelNames" dense dark stack-label @update:model-value="selectModel2" />
      <q-select v-if="selectedModel2 !== ''" label-color="green" class="q-pa-xs col" v-model="selectedProp2" square
        label="prop y" hide-hint :options="prop2Names" dense dark stack-label @update:model-value="selectProp2" />
    </div>

    <!-- chart -->
    <Scatter v-if="isEnabled" ref="myChart" id="my-chart-id-xy" :options="chartOptions" :data="chartData"
      style="max-height: 300px;" />
    <!-- bottom buttons -->
    <div v-if="isEnabled" class="q-ma-sm text-overline justify-center q-gutter-sm row">
      <q-checkbox v-if="autoscaleEnabled" v-model="autoscale" dense size="xs" label="autoscale"
        @update:model-value="toggleAutoscaling" />
      <q-input v-if="!autoscale" v-model.number="x_min" type="number" @update:model-value="autoscaling" label="x min"
        filled dense hide-bottom-space style="max-width: 75px;" />
      <q-input v-if="!autoscale" v-model.number="x_max" type="number" @update:model-value="autoscaling" label="x max"
        filled dense hide-bottom-space style="max-width: 75px;" />
      <q-input v-if="!autoscale" v-model.number="y_min" type="number" @update:model-value="autoscaling" label="y min"
        filled dense hide-bottom-space style="max-width: 75px;" />
      <q-input v-if="!autoscale" v-model.number="y_max" type="number" @update:model-value="autoscaling" label="y max"
        filled dense hide-bottom-space style="max-width: 75px;" />

      <q-checkbox v-if="multipliersEnabled" v-model="scaling" @update:model-value="toggleFactors" dense size="xs"
        label="factors" />
      <q-input v-if="scaling && selectedProp1 !== ''" v-model.number="chart1_factor" type="number" label="x factor"
        filled dense style="max-width: 75px;" />
      <q-input v-if="scaling && selectedProp2 !== ''" v-model.number="chart2_factor" type="number" label="y factor"
        filled dense style="max-width: 75px;" />

      <q-checkbox v-if="analysisEnabled" v-model="show_summary" dense label="statistics" size="sm"
        @update:model-value="toggleSummary" />
      <q-checkbox v-if="presetsEnabled" v-model="showPresets" dense label="presets" size="sm" />

      <q-btn v-if="exportEnabled" color="black" size="sm" @click="exportData" icon="fa-solid fa-file-export"></q-btn>
      <q-btn color="negative" size="xs" @click="clearProps" icon="fa-solid fa-trash-can"></q-btn>
      <q-toggle v-model="state.configuration.chart_hires" label="hi-res" dense size="sm"
        @update:model-value="toggleHires" />
      <q-input v-if="!state.configuration.chart_hires" v-model.number="rtWindow" type="number" label="time" filled dense
        min="1" max="30" hide-bottom-space @update:model-value="updateRtWindow" />
    </div>
    <!-- presets -->
    <div v-if="isEnabled && showPresets" class="q-mb-sm text-overline justify-center q-gutter-xs row">
      <div v-for="(field, index) in presets" :key="index">
        <div class="col q-mb-sm text-left text-secondary" :style="{ 'font-size': '12px' }">
        </div>
        <q-btn @click="processDefault(field)" color="primary" size="sm" squared>{{ index }}</q-btn>
      </div>
    </div>
    <!-- statistics -->
    <div v-if="show_summary && isEnabled" class="q-mt-sm">
      <div v-if="p1 !== '' && show_summary" class="q-gutter-xs row justify-center q-mt-xs">
        <q-input label-color="red" color="black" v-model="p1_max" outlined dense square label="x max"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="red" color="black" v-model="p1_min" outlined dense square label="x min"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="red" color="black" v-model="p1_mean" outlined dense square label="x mean"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="red" color="black" v-model="p1_sd" outlined dense square label="x sd"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="red" color="black" v-model="p1_permin" outlined dense square label="x /min"
          style="width: 100px; font-size: 12px" />
      </div>
      <div v-if="p2 !== '' && show_summary" class="q-gutter-xs row justify-center q-mt-xs">
        <q-input label-color="green" color="black" v-model="p2_max" outlined dense square label="y max"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="green" color="black" v-model="p2_min" outlined dense square label="y min"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="green" color="black" v-model="p2_mean" outlined dense square label="y mean"
          style="width: 100px; font-size: 12px" />
        <q-input label-color="green" color="black" v-model="p2_sd" outlined dense square label="y sd"
          style="width: 100px; font-size: 12px" />

        <q-input label-color="green" color="black" v-model="p2_permin" outlined dense square label="y /min"
          style="width: 100px; font-size: 12px" />
      </div>

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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)


export default {
  setup() {
    const state = useStateStore()
    // make the chartdata reactive
    let chartData = {
      labels: [],
      backgroundColor: '#888888',
      datasets: [{
        data: [],
        borderColor: 'rgb(192, 0, 0)',
        borderWidth: 1,
        pointStyle: false
      }
      ]
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
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: '#333333'
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
    alive: Boolean,
    title: String,
    presets: Object,
    loadPreset: Boolean

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
      x_min: 2,
      x_max: 20.0,
      y_min: 0,
      y_max: 25,
      multipliersEnabled: true,
      scaling: false,
      chart1_factor: 1.0,
      chart2_factor: 1.0,
      exportEnabled: true,
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
      modelNames: [],
      prop1Names: [],
      prop2Names: [],
      seconds: 0,
      y1_axis: [],
      y2_axis: [],
      x_values: [],
      y_values: [],
      redrawInterval: -1,
      redrawTimer: 0.0,
      debug_mode: true
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
    clearProps() {
      this.p1 = ""
      this.selectedModel1 = ""
      this.selectedProp1 = ""
      this.p2 = ""
      this.selectedModel2 = ""
      this.selectedProp2 = ""
    },
    processDefault(props) {
      let _default = [...props]
      explain.watchModelProps(_default)

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
    },
    toggleFactors() {
      if (!this.scaling) {
        this.chart1_factor = 1.0
        this.chart2_factor = 1.0
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

    },
    analyzeDataRt() {
      if (this.p1 !== '') {
        this.p1_max = Stat.max(this.x_values).toFixed(4)
        this.p1_min = Stat.min(this.x_values).toFixed(4)
        this.p1_sd = Stat.standardDeviation(this.x_values).toFixed(4)
        this.p1_mean = Stat.mean(this.x_values).toFixed(4)
        this.p1_permin = Stat.sum(this.x_values).toFixed(4)
        this.p1_perbeat = 0.0
      }

      if (this.p2 !== '') {
        this.p2_max = Stat.max(this.y_values).toFixed(4)
        this.p2_min = Stat.min(this.y_values).toFixed(4)
        this.p2_sd = Stat.standardDeviation(this.y_values).toFixed(4)
        this.p2_mean = Stat.mean(this.y_values).toFixed(4)
        this.p2_permin = Stat.sum(this.y_values).toFixed(4)
        this.p2_perbeat = 0.0
      }

    },
    analyzeData() {

      this.resetAnalysis()

      let param1 = []
      let param2 = []

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

    },
    toggleAutoscaling() {
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
              min: this.x_min,
              max: this.x_max,
              grid: {
                color: '#333333'
              },
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
              grid: {
                color: '#333333'
              },
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
    dataUpdateRt() {
      if (this.alive && this.$refs.myChart) {
        // update is every 0.015 ms and the data is sampled with 0.005 ms resolution (so 3 data points per 0.015 sec = 200 datapoints per second)
        for (let i = 0; i < explain.modelData.length; i++) {
          this.y1_axis.push({ x: explain.modelData[i][this.p1] * this.chart1_factor, y: explain.modelData[i][this.p2] * this.chart2_factor })
          this.x_values.push(explain.modelData[i][this.p1] * this.chart1_factor)
          this.y_values.push(explain.modelData[i][this.p2] * this.chart2_factor)
          this.seconds += 0.005;
        }

        if (this.y1_axis.length > this.rtWindowValidated * 200.0) {
          let too_many = this.y1_axis.length - (this.rtWindowValidated * 200.0)
          this.y1_axis.splice(0, too_many)
          this.x_values.splice(0, too_many)
          this.y_values.splice(0, too_many)
        }


        if (this.redrawTimer > this.redrawInterval) {
          this.redrawTimer = 0;
          const myChart = this.$refs.myChart.chart
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

      if (this.p1 !== '') {
        this.y1_axis = explain.modelData.map((item) => { return { x: item[this.p1] * this.chart1_factor, y: item[this.p2] * this.chart2_factor } });
        data_sets.push({
          data: this.y1_axis,
          borderColor: 'rgb(192, 0, 0)',
          borderWidth: 1,
          pointStyle: false
        })
      }

      if (data_sets.length > 0) {
        this.x_axis = [...Array(this.y1_axis.length).keys()]
      }

      this.chartData = {
        datasets: [...data_sets]
      }

      if (this.show_summary) {
        this.analyzeDataRt()
      }
      // prepare for realtime analysis
      this.seconds = 0
      this.x_axis = []
      this.y1_axis = []
      this.x_values = []
      this.y_values = []

    },
    exportData() {
      let header = ""
      let data = {
        time: explain.modelData.map((item) => { return item['time'] }),
      }


      if (this.p1 !== "") {
        let h1 = this.selectedModel1.toUpperCase() + this.selectedProp1.toUpperCase() + "_";
        header += h1
        data[h1] = explain.modelData.map((item) => { return (parseFloat(item[this.p1])) });

        let h2 = this.selectedModel2.toUpperCase() + this.selectedProp2.toUpperCase() + "_";
        header += h2
        data[h2] = explain.modelData.map((item) => { return (parseFloat(item[this.p2])) });
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

    this.$bus.on("state", this.processAvailableModels)
    this.$bus.on("data", () => this.dataUpdate())

    if (this.loadPreset) {
      const firstKey = Object.keys(this.presets)[0]; // Get the key of the first property
      const firstValue = this.presets[firstKey]; // Access the value of the first property

      this.processDefault(firstValue)
    }

    // check whether hires is enabled
    this.toggleHires()

  },
};
</script>

<style></style>
