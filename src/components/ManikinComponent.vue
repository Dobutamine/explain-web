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
      <div class="q-mt-sm row text-overline justify-center">
        airway pressure (cmh2o)
      </div>
      <Line
        v-if="isEnabled && !show_loops"
        ref="myTest"
        id="my-chart-manikin-pres"
        :options="chartOptions"
        :data="chartData"
        style="max-height: 250px"
      />
    </div>

    <XYChartComponent
      v-if="isEnabled && show_loops"
      :alive="show_loops"
      title=""
      :presets="presets_loops"
      :load-preset="true"
    ></XYChartComponent>

    <div
      v-if="isEnabled"
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
            { label: 'OFF', value: 'OFF' },
            { label: 'ON', value: 'ON' },
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
            { label: 'CURVES', value: false },
            { label: 'LOOPS', value: true },
          ]"
        />
      </div>
      <div>
        <q-btn class="q-ml-sm" color="grey-9" size="sm" @click="connect_manikin"
          >CONNECT</q-btn
        >
      </div>
    </div>
    <div
      v-if="isEnabled"
      class="q-mt-sm text-overline justify-center q-gutter-xs row"
    >
      <div>
        <q-toggle
          v-model="spont_breathing"
          size="sm"
          label="breathing"
          @update:model-value="toggle_spont_breathing"
        />
      </div>
      <div>
        <q-toggle
          class="q-ml-sm q-pb-lg"
          v-model="state.configuration.chart_hires"
          label="hi-res"
          dense
          size="sm"
          @update:model-value="toggleHires"
        />
      </div>
      <div>
        <q-input
          v-if="!show_loops && !state.configuration.chart_hires"
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
    <!-- manikin controls -->

    <div
      v-if="isEnabled && manikin_running"
      class="text-overline justify-center q-gutter-sm row"
    >
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
    </div>

    <div
      v-if="isEnabled && manikin_running"
      class="q-mt-md q-mb-md text-overline justify-center q-gutter-xs row"
    >
      <q-input
        v-model="et_tube_diameter"
        @update:model-value="set_ettube_diameter"
        color="blue"
        hide-hint
        filled
        label="et tube diameter (mm)"
        :min="2.0"
        :max="5.0"
        :step="0.5"
        dense
        stack-label
        type="number"
        style="font-size: 14px; width: 120px"
        class="q-mr-sm text-center"
        squared
      >
      </q-input>
      <q-input
        v-model="et_tube_length"
        @update:model-value="set_ettube_length"
        color="blue"
        hide-hint
        filled
        label="et tube length (mm)"
        :min="50"
        :max="110"
        :step="5"
        dense
        stack-label
        type="number"
        style="font-size: 14px; width: 120px"
        class="q-mr-sm text-center"
        squared
      >
      </q-input>
      <q-input
        v-model="temp"
        @update:model-value="set_temp"
        color="blue"
        hide-hint
        filled
        label="temperature (C)"
        :min="0"
        :max="60"
        :step="0.1"
        dense
        stack-label
        type="number"
        style="font-size: 14px; width: 120px"
        class="q-mr-sm text-center"
        squared
      >
      </q-input>
      <q-input
        v-model="humidity"
        @update:model-value="set_humidity"
        color="blue"
        hide-hint
        filled
        label="humidity (%)"
        :min="0"
        :max="100"
        :step="1"
        dense
        stack-label
        type="number"
        style="font-size: 14px; width: 120px"
        class="q-mr-sm text-center"
        squared
      >
      </q-input>
    </div>
  </q-card>
</template>

<script>
import { useStateStore } from "src/stores/state";
import { explain } from "../boot/explain";
import { Bar, Line, Scatter } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { shallowRef } from "vue";
import * as Stat from "simple-statistics";
import XYChartComponent from "./XYChartComponent.vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);
export default {
  setup() {
    const state = useStateStore();
    const manikinData = shallowRef([]);
    let port;
    let reader;
    let writer;
    let textDecoder;
    let textEncoder;

    const connect_manikin = async () => {
      let buffer = ""; // Buffer to hold incomplete data
      try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        textDecoder = new TextDecoderStream();
        textEncoder = new TextEncoder();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        // Prepare the writer for sending data
        writer = port.writable.getWriter();
        reader = textDecoder.readable.getReader();

        while (true) {
          const { value, done } = await reader.read();

          //console.log(value);
          if (done) break;
          buffer += value; // Append incoming data to the buffer

          // Process complete lines
          let lines = buffer.split("\n");
          buffer = lines.pop(); // Keep the incomplete line in the buffer

          for (const line of lines) {
            explain.updateAirwayPressure(line.trim());
          }
        }
      } catch (err) {
        console.error("Failed to connect:", err);
      }
    };

    const sendData = async (data) => {
      if (!writer) {
        console.error("Serial port is not connected.");
        return;
      }

      try {
        await writer.write(textEncoder.encode(data + "\n")); // Add newline if required
      } catch (err) {
        console.error("Error writing to serial port:", err);
      }
    };

    // make the chartdata reactive
    let chartData = shallowRef({
      labels: [],
      backgroundColor: "#888888",
      datasets: [
        {
          data: [],
          borderColor: "rgb(192, 0, 0)",
          borderWidth: 2,
          pointStyle: false,
        },
      ],
    });

    let chartOptions = shallowRef({
      responsive: true,
      animation: false,
      spanGaps: true,
      showLine: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      datasets: {
        line: {
          pointRadius: 0, // disable for all `'line'` datasets
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            color: "#444444",
          },
          border: {
            display: false,
          },
        },
        y: {
          grid: {
            color: "#333333",
          },
          border: {
            display: false,
          },
        },
      },
    });

    return {
      state,
      chartData,
      chartOptions,
      manikinData,
      connect_manikin,
      sendData,
    };
  },
  props: {
    alive: Boolean,
  },
  components: {
    Bar,
    Line,
    Scatter,
    XYChartComponent,
  },
  data() {
    return {
      manikin_running: false,
      spont_breathing: true,
      show_summary: false,
      show_loops: false,
      rtWindow: 3,
      rtWindowValidated: 3,
      autoscale: false,
      isEnabled: true,
      et_tube_diameter: 3.5,
      et_tube_length: 110,
      fio2: 21,
      temp: 37.0,
      humidity: 100,
      trigger_perc: 6.0,
      mode: "OFF",
      x_min: 2,
      x_max: 15.0,
      y_min: 0,
      y_max: 25,
      scaling: false,
      chart1_factor: 1.0,
      title: "EXPLAIN HARDWARE INTERFACE",
      selectedModel1: "Manikin",
      selectedProp1: "airway_pressure",
      p1: "Manikin.airway_pressure",
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
      presets_loops: {
        "PV LOOP": ["Manikin.airway_pressure", "THORAX.vol"],
      },
      update_model: true,
      curve_param: "pres",
      port: null,
      lung_volume: 0.0,
    };
  },
  methods: {
    set_ettube_diameter() {
      if (this.update_model) {
        if (this.et_tube_diameter >= 1.5 && this.et_tube_diameter < 10.0) {
          explain.callModelFunction("Ventilator.set_ettube_diameter", [
            this.et_tube_diameter,
          ]);
        }
      }
    },
    set_ettube_length() {
      if (this.update_model) {
        if (this.et_tube_length >= 50 && this.et_tube_length < 300) {
          explain.callModelFunction("Ventilator.set_ettube_length", [
            this.et_tube_length,
          ]);
        }
      }
    },
    toggleHires() {
      if (this.state.configuration.chart_hires) {
        this.rtWindow = 1.0;
        explain.setSampleInterval(0.0015);
      } else {
        this.rtWindow = 3.0;
        explain.setSampleInterval(0.005);
      }
    },
    toggle_spont_breathing() {
      if (this.update_model) {
        explain.callModelFunction("Breathing.switch_breathing", [
          this.spont_breathing,
        ]);
      }
    },
    set_fio2() {
      if (this.update_model) {
        explain.callModelFunction("Manikin.set_fio2", [parseFloat(this.fio2)]);
      }
    },
    set_temp() {
      if (this.update_model) {
        explain.callModelFunction("Manikin.set_temp", [parseFloat(this.temp)]);
      }
    },
    set_humidity() {
      if (this.update_model) {
        explain.callModelFunction("Manikin.set_humidity", [
          parseFloat(this.humidity / 100.0),
        ]);
      }
    },
    update_watch_list() {
      explain.watchModelPropsSlow([
        "Manikin.airway_pressure",
        "Manikin.compression_pressure",
        "Manikin.lung_volume",
      ]);
    },
    update_ventilator_setttings() {
      if (this.update_model) {
        switch (this.mode) {
          case "OFF":
            this.manikin_running = false;
            break;
          case "ON":
            this.manikin_running = true;
            this.update_watch_list();
            break;
        }
      }
    },
    clearProps() {
      this.p1 = "Manikin.airway_pressure";
      this.selectedModel1 = "Manikin";
      this.selectedProp1 = "airway_pressure";
    },
    toggleFactors() {
      if (!this.scaling) {
        this.chart1_factor = 1.0;
      }
    },
    updateRtWindow() {
      if (this.rtWindow < 1.0) {
        this.rtWindow = 1.0;
      }
      if (this.rtWindow > 10.0) {
        this.rtWindow = 10.0;
      }

      this.rtWindowValidated = this.rtWindow;
    },
    resetAnalysis() {
      this.p1_max = 0.0;
      this.p1_min = 0.0;
      this.p1_sd = 0.0;
      this.p1_mean = 0.0;
      this.p1_permin = 0.0;
      this.p1_perbeat = 0.0;
    },
    analyzeDataRt() {
      if (this.p1 !== "") {
        this.p1_max = Stat.max(this.y1_axis).toFixed(4);
        this.p1_min = Stat.min(this.y1_axis).toFixed(4);
        this.p1_sd = Stat.standardDeviation(this.y1_axis).toFixed(4);
        this.p1_mean = Stat.mean(this.y1_axis).toFixed(4);
        this.p1_permin = Stat.sum(this.y1_axis).toFixed(4);
        this.p1_perbeat = 0.0;
      }
    },
    analyzeData() {
      this.resetAnalysis();

      let param1 = [];

      if (this.p1 !== "") {
        param1 = explain.modelData.map((item) => {
          return item[this.p1] * this.chart1_factor;
        });
        this.p1_max = Stat.max(param1).toFixed(4);
        this.p1_min = Stat.min(param1).toFixed(4);
        this.p1_sd = Stat.standardDeviation(param1).toFixed(4);
        this.p1_mean = Stat.mean(param1).toFixed(4);
        this.p1_permin = Stat.sum(param1).toFixed(4);
        this.p1_perbeat = 0.0;
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
              display: false,
            },
          },
          datasets: {
            line: {
              pointRadius: 0, // disable for all `'line'` datasets
            },
          },
          scales: {
            x: {
              display: false,
            },
            y: {
              min: this.y_min,
              max: this.y_max,
              grid: {
                color: "#333333",
              },
            },
          },
        };
      } else {
        this.chartOptions = {
          responsive: true,
          animation: false,
          spanGaps: true,
          showLine: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          datasets: {
            line: {
              pointRadius: 0, // disable for all `'line'` datasets
            },
          },
          scales: {
            x: {
              display: false,
            },
            y: {
              grid: {
                color: "#333333",
              },
            },
          },
        };
      }
    },
    dataUpdateRt() {
      this.lung_volume = explain.modelData[0]["Manikin.lung_volume"];
      this.sendData(this.lung_volume * 1000.0);
      if (this.alive && !this.show_loops) {
        // update is every 0.015 ms and the data is sampled with 0.005 ms resolution (so 3 data points per 0.015 sec = 200 datapoints per second)
        for (let i = 0; i < explain.modelData.length; i++) {
          this.y1_axis.push(explain.modelData[i][this.p1] * this.chart1_factor);
          this.x_axis.push(this.seconds);
          this.seconds += 0.005;
        }

        if (this.x_axis.length > this.rtWindowValidated * 200.0) {
          let too_many = this.x_axis.length - this.rtWindowValidated * 200.0;
          this.x_axis.splice(0, too_many);
          this.y1_axis.splice(0, too_many);
        }

        if (this.redrawTimer > this.redrawInterval) {
          this.redrawTimer = 0;
          const myChart = this.$refs.myTest.chart;
          myChart.data.labels = this.x_axis;
          myChart.data.datasets[0].data = [...this.y1_axis];
          requestAnimationFrame(() => {
            myChart.update();
          });

          if (this.show_summary) {
            this.analyzeDataRt();
          }
        }
        this.redrawTimer += 0.015;
      }
    },
    toggleSummary() {
      if (this.show_summary) {
        this.analyzeData();
      }
    },
    dataUpdate() {
      let data_set_pres = {};
      if (this.p1 !== "") {
        this.y1_axis = explain.modelData.map((item) => {
          return item[this.p1] * this.chart1_factor;
        });
        data_set_pres = {
          data: this.y1_axis,
          borderColor: "rgb(192, 0, 0)",
          borderWidth: 1,
          pointStyle: false,
        };
      }

      this.x_axis = [...Array(this.y1_axis.length).keys()];

      this.chartData = {
        labels: this.x_axis,
        datasets: [data_set_pres],
      };

      if (this.show_summary) {
        this.analyzeDataRt();
      }
      // prepare for realtime analysis
      this.seconds = 0;
      this.x_axis = [];
      this.y1_axis = [];
    },
    processModelState() {
      if (explain.modelState.models) {
      }
    },
  },
  mounted() {
    if ("serial" in navigator) {
      console.log("Web Serial API is supported!");
    } else {
      console.log("Web Serial API is not supported by this browser.");
    }

    this.$bus.on("rtf", () => this.dataUpdateRt());
    this.$bus.on("data", () => this.dataUpdate());
    this.$bus.on("state", this.processModelState);
    explain.watchModelProps([
      "Manikin.airway_pressure",
      "Manikin.compression_pressure",
      "Manikin.lung_volume",
    ]);

    // check whether hires is enabled
    this.toggleHires();
  },
};
</script>

<style></style>
