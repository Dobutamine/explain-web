<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="q-mt-es row gutter text-overline justify-center"
      @click="isEnabled = !isEnabled"
    >
      {{ title }}
    </div>
    <div v-if="isEnabled"
        class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center q-gutter-xs row"
      >
      <q-select
          label-color="red"
          class="q-pa-xs col"
          v-model="selectedModel1"
          square
          label="model1"
          hide-hint
          :options="modelNames"
          dense
          dark
          stack-label
          @update:model-value="selectModel1"
        />
        <q-select
          v-if="selectedModel1 !== ''"
          label-color="red"
          class="q-pa-xs col"
          v-model="selectedProp1"
          square
          label="prop1"
          hide-hint
          :options="prop1Names"
          dense
          dark
          stack-label
          @update:model-value="selectProp1"
        />
        <q-select
          label-color="green"
          class="q-pa-xs col"
          v-model="selectedModel2"
          square
          label="model2"
          hide-hint
          :options="modelNames"
          dense
          dark
          stack-label
          @update:model-value="selectModel2"
        />
        <q-select
          v-if="selectedModel2 !== ''"
          label-color="green"
          class="q-pa-xs col"
          v-model="selectedProp2"
          square
          label="prop2"
          hide-hint
          :options="prop2Names"
          dense
          dark
          stack-label
          @update:model-value="selectProp2"
        />
        <q-select
          label-color="light-blue"
          class="q-pa-xs col"
          v-model="selectedModel3"
          square
          label="model3"
          hide-hint
          :options="modelNames"
          dense
          dark
          stack-label
          @update:model-value="selectModel3"
        />
        <q-select
          v-if="selectedModel3 !== ''"
          label-color="light-blue"
          class="q-pa-xs col"
          v-model="selectedProp3"
          square
          label="select model"
          hide-hint
          :options="prop3Names"
          dense
          dark
          stack-label
          @update:model-value="selectProp3"
        />
    </div>
      <Line v-if="isEnabled"
        id="my-chart-id"
        :options="chartOptions"
        :data="chartData"
      />
      <div v-if="isEnabled"
        class="text-overline justify-center q-gutter-xs row"
      >
              <q-checkbox
                v-if="autoscaleEnabled"
                v-model="autoscale"
                dense
                size="xs"
                label="autoscale"
                @update:model-value="autoscaling"
                style="font-size: 10px"
              />
              <q-input
                v-if="!autoscale"
                v-model.number="y_min"
                type="number"
                @update:model-value="autoscaling"
                label="y min"
                filled
                dense
                hide-bottom-space
                style="width: 75px; font-size: 10px"
              />
              <q-input
                v-if="!autoscale"
                v-model.number="y_max"
                type="number"
                @update:model-value="autoscaling"
                label="y max"
                filled
                dense
                hide-bottom-space
                style="width: 75px; font-size: 10px"
              />

              <q-checkbox
                v-if="multipliersEnabled"
                v-model="scaling"
                dense
                size="xs"
                label="factors"
                style="font-size: 10px"
              />
              <q-input
                v-if="scaling && selectedProp1 !== ''"
                v-model.number="chart1_factor"
                type="number"
                label="y1 factor"
                filled
                dense
                style="width: 75px; font-size: 10px"
              />
              <q-input
                v-if="scaling && selectedProp2 !== ''"
                v-model.number="chart2_factor"
                type="number"
                label="y2 factor"
                filled
                dense
                style="width: 75px; font-size: 10px"
              />
              <q-input
                v-if="scaling && selectedProp3 !== ''"
                v-model.number="chart3_factor"
                type="number"
                label="y3 factor"
                filled
                dense
                style="width: 75px; font-size: 10px"
              />


              <q-input
                v-model.number="rtWindow"
                type="number"
                label="rt window"
                filled
                dense
                min="1"
                max="30"
                hide-bottom-space
                @update:model-value="updateRtWindow"
                style="width: 75px; font-size: 10px"
              />
              <q-btn
                v-if="analysisEnabled"
                color="black"
                size="xs"
                @click="toggleSummary"

                icon="fa-solid fa-magnifying-glass-chart"
                ></q-btn
              >
              <q-btn
                v-if="analysisEnabled"
                color="black"
                size="xs"
                @click="analyzeData"

                icon="fa-solid fa-file-export"
                ></q-btn
              >
      </div>
      <div v-if="show_summary" class="q-mt-sm">
          <div
            v-if="p1 !== '' && show_summary"
            class="q-gutter-xs row justify-center q-mt-xs"
          >
            <q-input
              color="black"
              v-model="p1_max"
              outlined
              dense
              square
              label="y1 max"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p1_min"
              outlined
              dense
              square
              label="y1 min"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p1_perbeat"
              outlined
              dense
              square
              label="y1 max-min"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p1_mean"
              outlined
              dense
              square
              label="y1 mean"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p1_sd"
              outlined
              dense
              square
              label="y1 sd"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p1_permin"
              outlined
              dense
              square
              label="y1 /min"
              style="width: 100px; font-size: 12px"
            />
          </div>
          <div
            v-if="p2 !== '' && show_summary"
            class="q-gutter-xs row justify-center q-mt-xs"
          >
            <q-input
              color="black"
              v-model="p2_max"
              outlined
              dense
              square
              label="y2 max"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p2_min"
              outlined
              dense
              square
              label="y2 min"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p2_perbeat"
              outlined
              dense
              square
              label="y2 max-min"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p2_mean"
              outlined
              dense
              square
              label="y2 mean"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p2_sd"
              outlined
              dense
              square
              label="y2 sd"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p2_permin"
              outlined
              dense
              square
              label="y2 /min"
              style="width: 100px; font-size: 12px"
            />
          </div>
          <div
            v-if="p3 !== '' && show_summary"
            class="q-gutter-xs row justify-center q-mt-xs"
          >
            <q-input
              color="black"
              v-model="p3_max"
              outlined
              dense
              square
              label="y3 max"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p3_min"
              outlined
              dense
              square
              label="y3 min"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p3_perbeat"
              outlined
              dense
              square
              label="y3 max-min"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p3_mean"
              outlined
              dense
              square
              label="y3 mean"
              style="width: 100px; font-size: 12px"
            />
            <q-input
              color="black"
              v-model="p3_sd"
              outlined
              dense
              square
              label="y3 sd"
              style="width: 100px; font-size: 12px"
            />

            <q-input
              color="black"
              v-model="p3_permin"
              outlined
              dense
              square
              label="y3 /min"
              style="width: 100px; font-size: 12px"
            />
          </div>

        </div>


  </q-card>
</template>

<script>
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { ref } from 'vue'
import * as Stat from "simple-statistics";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)


export default {
  setup() {
    // make the chartdata reactive
    let chartData = ref({
        labels: [],
        backgroundColor: '#888888',
        datasets: [ { data: [] } ]
      })

      let chartOptions = ref({
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
      chartData,
      chartOptions
    }

  },
  props: {

  },
  components: {
    Bar,
    Line,
    Scatter
  },
  data() {
    return {
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
      exportEnabled: false,
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
      redrawInterval: -1,
      redrawTimer: 0.0,
      debug_mode: true

    };
  },
  methods: {
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
        this.p1_permin = 0.0
        this.p1_perbeat = 0.0
      }

      if (this.p2 !== '') {
        param2 = explain.modelData.map((item) => {return item[this.p2] * this.chart2_factor;});
        this.p2_max = Stat.max(param2).toFixed(4)
        this.p2_min = Stat.min(param2).toFixed(4)
        this.p2_sd = Stat.standardDeviation(param2).toFixed(4)
        this.p2_mean = Stat.mean(param2).toFixed(4)
        this.p2_permin = 0.0
        this.p2_perbeat = 0.0
      }

      if (this.p3 !== '') {
        param3 = explain.modelData.map((item) => {return item[this.p3] * this.chart3_factor;});
        this.p3_max = Stat.max(param3).toFixed(4)
        this.p3_min = Stat.min(param3).toFixed(4)
        this.p3_sd = Stat.standardDeviation(param3).toFixed(4)
        this.p3_mean = Stat.mean(param3).toFixed(4)
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
    exportData() {

    },
    selectModel1() {
      this.prop1Names = [""]
      this.selectedProp1 = ""
      this.p1 = ""
      if (this.selectedModel1 !== "") {
        Object.keys(explain.modelState.models[this.selectedModel1]).forEach(prop => {
        if (typeof(explain.modelState.models[this.selectedModel1][prop]) === 'number') {
            if (prop[0] !== "_") {
              this.prop1Names.push(prop)
            }
          }
        })
        this.prop1Names.sort()
      } else {
        this.selectedProp1 =""
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
          if (typeof(explain.modelState.models[this.selectedModel2][prop]) === 'number') {
            if (prop[0] !== "_") {
              this.prop2Names.push(prop)
            }
          }
        })
        this.prop2Names.sort()
      } else {
        this.selectedProp2 =""
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
      if (this.selectedModel3 !== "") {
        Object.keys(explain.modelState.models[this.selectedModel3]).forEach(prop => {
          if (typeof(explain.modelState.models[this.selectedModel3][prop]) === 'number') {
            if (prop[0] !== "_") {
              this.prop3Names.push(prop)
            }
          }
        })
        this.prop3Names.sort()
      } else {
        this.selectedProp3 =""
        this.p3 = ""
      }

    },
    selectProp3() {
      this.selectedProp3 = ""
      this.p3 = ""
      if (this.selectedProp3 !== "") {
        this.p3 = this.selectedModel3 + "." + this.selectedProp3
        explain.watchModelProps([this.p3])
      } else {
        this.selectedModel3 = ""
        this.p3 = ""
      }


    },
    dataUpdateRt() {
      this.show_summary = false
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
        this.chartData = {
          labels: this.x_axis,
          datasets: [ {
            data: [...this.y1_axis],
            borderColor: 'rgb(192, 0, 0)',
            borderWidth: 1,
            pointStyle: false
          }, {
            data: [...this.y2_axis],
            borderColor: 'rgb(0, 192, 0)',
            borderWidth: 1,
            pointStyle: false
          }, {
            data: [...this.y3_axis],
            borderColor: 'rgb(0, 192, 192)',
            borderWidth: 1,
            pointStyle: false
          } ]
        }
      }
      this.redrawTimer += 0.015
    },
    processAvailableModels() {
      this.modelNames = [""]
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)]
          this.modelNames.push("")
          this.modelNames.sort()

      }
      } catch {}
    },
    toggleSummary() {
      this.show_summary = !this.show_summary

      if (this.show_summary) {
        this.analyzeData()
      }
    },
    dataUpdate() {

      let data_sets = []

      if (this.p1 !== '') {
        this.y1_axis = explain.modelData.map((item) => {return item[this.p1] * this.chart1_factor;});
        data_sets.push({
              data: this.y1_axis,
              borderColor: 'rgb(192, 0, 0)',
              borderWidth: 1,
              pointStyle: false
            })
      }

      if (this.p2 !== '') {
        this.y2_axis = explain.modelData.map((item) => {return item[this.p2] * this.chart2_factor;});
        data_sets.push({
              data: this.y2_axis,
              borderColor: 'rgb(0, 192, 0)',
              borderWidth: 1,
              pointStyle: false
            });
      }

      if (this.p3 !== '') {
        this.y3_axis = explain.modelData.map((item) => {return item[this.p3] * this.chart3_factor;});
        data_sets.push({
              data: this.y3_axis,
              borderColor: 'rgb(0, 192, 192)',
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

      // prepare for realtime analysis
      this.seconds = 0
      this.x_axis = []
      this.y1_axis = []
      this.y2_axis = []
      this.y3_axis = []

      this.analyzeData()
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

    explain.watchModelProps(["AA.pres", "PA.pres", "LV.pres"])

  },
};
</script>

<style></style>
