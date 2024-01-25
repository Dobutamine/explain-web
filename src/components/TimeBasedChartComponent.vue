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


  </q-card>
</template>

<script>
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { ref } from 'vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)


export default {
  setup() {
    // make the chartdata reactive
    let chartData = ref({
        labels: [],
        backgroundColor: '#888888',
        datasets: [ { data: [] } ]
      })

    return {
      chartData
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
      title: "TIME CHART",
      isEnabled: true,
      selectedModel1: "",
      selectedProp1: "",
      selectedModel2: "",
      selectedProp2: "",
      selectedModel3: "",
      selectedProp3: "",
      modelNames: [],
      prop1Names: [],
      prop2Names: [],
      prop3Names: [],
      chartOptions: {
        responsive: true,
        backgroundColor: '#888888',
        animation: false,
        scales: {
            x: {
              display: false
            },
            y: {
                suggestedMax: 20,
                suggestedMin: 100
            }
        }
      },
      seconds: 0,
      y_axis: [],
      x1_axis: [],
      x2_axis: [],
      x3_axis: [],
      redrawInterval: -1.0,
      redrawTimer: 0.0

    };
  },
  methods: {
    selectModel1() {
      this.prop1Names = []
      Object.keys(explain.modelState.models[this.selectedModel1]).forEach(prop => {
        if (typeof(explain.modelState.models[this.selectedModel1][prop]) === 'number') {
          if (prop[0] !== "_") {
            this.prop1Names.push(prop)
          }
        }
      })
    },
    selectProp1() {

},
    selectModel2() {
      this.prop2Names = []
      Object.keys(explain.modelState.models[this.selectedModel2]).forEach(prop => {
        if (typeof(explain.modelState.models[this.selectedModel2][prop]) === 'number') {
          if (prop[0] !== "_") {
            this.prop2Names.push(prop)
          }
        }
      })

    },
    selectProp2() {

    },
    selectModel3() {
      this.prop3Names = []
      Object.keys(explain.modelState.models[this.selectedModel3]).forEach(prop => {
        if (typeof(explain.modelState.models[this.selectedModel3][prop]) === 'number') {
          if (prop[0] !== "_") {
            this.prop3Names.push(prop)
          }
        }
      })

    },
    selectProp3() {

    },
    dataUpdate() {
      this.currentData =
        explain.modelData[explain.modelDataSlow.length - 1];

      this.x1_axis.push(this.currentData['AA.pres'])
      this.x2_axis.push(this.currentData['PA.pres'])
      this.x3_axis.push(this.currentData['LV.pres'])
      this.y_axis.push(this.seconds)
      if (this.y_axis.length > 200) {
        this.y_axis.shift()
        this.x1_axis.shift()
        this.x2_axis.shift()
        this.x3_axis.shift()
      }
      this.seconds += 1;

      if (this.redrawTimer > this.redrawInterval) {
        this.redrawTimer = 0;
        this.chartData = {
          labels: this.y_axis,
          datasets: [ {
            data: [...this.x1_axis],
            borderColor: 'rgb(192, 0, 0)',
            borderWidth: 2,
            pointStyle: false
          }, {
            data: [...this.x2_axis],
            borderColor: 'rgb(0, 192, 0)',
            borderWidth: 1,
            pointStyle: false
          }, {
            data: [...this.x3_axis],
            borderColor: 'rgb(0, 0, 192)',
            borderWidth: 1,
            pointStyle: false
          } ]
        }
      }
      this.redrawTimer += 0.015

      //console.log(this.x_axis)
    },
    processAvailableModels() {
      this.modelNames = []
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          //this.selectedModelName = this.modelNames[0]
          this.selectModel()
      }
      } catch {}
    }
  },
  beforeUnmount() {
  },
  mounted() {
    // get the realtime slow data
    this.$bus.on("rtf", () => {
      this.dataUpdate()
    });

    this.$bus.on("state", this.processAvailableModels)

    explain.watchModelProps(["AA.pres", "PA.pres", "LV.pres"])

  },
};
</script>

<style></style>
