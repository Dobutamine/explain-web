<template>
  <q-layout view="hHh lpR fFf">
    <q-header
      class="bg-indigo-10 text-white headerCustomStyle"
      height-hint="68"
    >
  </q-header>

  <q-page-container>
      <router-view />
    </q-page-container>

  <q-footer class="bg-grey-8 text-white footerCustomStyle">
    <q-toolbar>
      <q-toolbar-title class="text-overline">
          <div>{{ statusMessage }}</div>
        </q-toolbar-title>
        <div class="q-mr-lg text-overline">
          loaded model:
        </div>
        <div class="q-mr-lg text-overline">
          <q-file  class="text-overline text-bold" v-model="model_file" :display-value="modelName"  @update:model-value="upload">
          <q-tooltip> {{ modelDescription }} </q-tooltip>
        </q-file>
        </div>
        <div class="q-mr-md">
          <q-icon name="fa-solid fa-upload"></q-icon>
          <q-tooltip> load model definition </q-tooltip>
        </div>


        <q-btn
          flat
          round
          dense
          size="sm"
          :icon="butIcon"
          :color="butColor"
          class="q-mr-sm"
          @click="togglePlay"
        >
          <q-tooltip> start/stop model </q-tooltip></q-btn
        >
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="fa-solid fa-rotate-right"
          color="white"
          class="q-mr-sm"
          @click="reload"
        >
          <q-tooltip> restart model </q-tooltip></q-btn
        >

        <q-btn
          flat
          round
          dense
          :icon="butCalcIcon"
          size="sm"
          @click="calculate"
          :color="butCalcColor"
          class="q-mr-sm"
        >
          <q-tooltip> fast forward model</q-tooltip></q-btn
        >
        <q-select
          class="q-ml-md q-mr-md"
          label-color="white"
          v-model="selectedDuration"
          :options="durations"
          hide-bottom-space
          dense
          label="step (sec.)"
          style="width: 90px; font-size: 12px"
          ><q-tooltip> fast forward step size</q-tooltip></q-select
        >

        <q-btn
          flat
          round
          dense
          size="sm"
          icon="fa-solid fa-download"
          color="white"
          class="q-mr-sm"
          @click="save_state"
        >
          <q-tooltip> download model state </q-tooltip></q-btn
        >
        <q-btn
          flat
          round
          dense
          :icon="butDebugIcon"
          size="sm"
          @click="toggleDebug"
          :color="butDebugColor"
          class="q-mr-sm"
        >
          <q-tooltip> {{ butDebugCaption }}</q-tooltip></q-btn
        >

    </q-toolbar>

  </q-footer>

  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { explain } from 'src/boot/explain';

export default defineComponent({
  name: 'MainLayout',

  setup () {
  },
  data() {
    return {
      model_file: [],
      modelName: "",
      modelDescription: "",
      playArmed: false,
      calcRunning: false,
      rtState: false,
      debugState: false,
      butCaption: "PLAY",
      butColor: "white",
      butCalcColor: "white",
      butDebugColor: "negative",
      butDebugIcon: "fa-solid fa-bug",
      butDebugCaption: "no debug",
      butIcon: "fa-solid fa-play",
      butCalcIcon: "fa-solid fa-forward-step",
      butCalcCaption: "CALCULATE",
      infoMessage: "",
      statusMessage: "STATUS:",
      selectedDuration: 10,
      durations: [1, 2, 3, 5, 10, 20, 30, 60, 120, 240, 360, 600, 1200, 1800],
    }
  },
  methods: {
    upload() {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContents = e.target.result;
        let loaded_definition = JSON.parse(fileContents)
        explain.loadModelDefinition(loaded_definition)
        this.$bus.emit('reset')
      };

      // Read the file as Text or as needed
      reader.readAsText(this.model_file);


    },
    save_state() {
      explain.saveModelState()
    },
    toggleDebug() {
      this.debugState = !this.debugState
      if (this.debugState) {
        this.butDebugColor = "positive"
        this.butDebugCaption = "debug"
        explain.start_debugger();
      } else {
        this.butDebugColor = "negative"
        this.butDebugCaption = "no debug"
        explain.stop_debugger();
      }
    },
    togglePlay() {
      this.rtState = !this.rtState;
      if (this.rtState) {
        this.playArmed = true;
        this.selectedDuration = 3;
        explain.start();
        this.butColor = "negative";
        this.butIcon = "fa-solid fa-stop";
        this.butCaption = "STOP";
      } else {
        explain.stop();
        this.playArmed = false;
        this.butColor = "white";
        this.butIcon = "fa-solid fa-play";
        this.butCaption = "PLAY";
        // get the model state
        explain.getModelState()
      }
    },
    reload() {
      explain.restartModelDefinition();
    },
    calculate() {
      this.calcRunning = !this.calcRunning;
      if (this.calcRunning) {
        this.butCalcColor = "negative";
        explain.calculate(parseInt(this.selectedDuration));
      }
    },
    calculationReady(e) {
      if (this.statusMessage.includes("calculation ready")) {
        this.calcRunning = false;
        this.butCalcCaption = "CALCULATE";
        this.butCalcColor = "white";

        if (this.playArmed) {
          this.playArmed = false;
          explain.start();
        }
      }
    },
    infoUpdate() {
      this.infoMessage = explain.info_message;
      if (this.infoMessage.includes("model definition")) {
        this.modelName = explain.modelDefinition.name
        this.modelDescription = explain.modelDefinition.description
      }
      this.$bus.emit('info')

    },
    errorUpdate() {
      if (this.statusMessage.includes("dependency error")) {
        this.calcRunning = false;
        this.butCalcCaption = "CALCULATE";
        this.butCalcColor = "white";
        this.rtState = false;
        this.butColor = "white";
        this.butIcon = "fa-solid fa-play";
        this.butCaption = "PLAY";
      }
      this.$bus.emit('error')

    },
    statusUpdate() {
      this.$bus.emit('status')
      this.statusMessage = explain.status_message;
      this.calculationReady();
    },
    stateUpdate() {
      this.$bus.emit('state')
    },
    dataSlowUpdate() {
      this.$bus.emit('rts')
    },
    dataFastUpdate() {
      this.$bus.emit('rtf')
    },
    dataUpdate() {
      this.$bus.emit('data')
    }
  },
  beforeUnmount() {
    document.removeEventListener("state", this.stateUpdate);
    document.removeEventListener("status", this.statusUpdate);
    document.removeEventListener("info", this.statusUpdate);
    document.removeEventListener("error", this.errorUpdate);
    document.removeEventListener("rts", this.dataSlowUpdate);
    document.removeEventListener("rtf", this.dataFastUpdate);
    document.removeEventListener("data", this.dataUpdate);
  },
  mounted() {
    try {
      document.removeEventListener("status", this.statusUpdate);
    } catch {}
    document.addEventListener("status", this.statusUpdate);
    try {
      document.removeEventListener("state", this.stateUpdate);
    } catch {}
    document.addEventListener("state", this.stateUpdate);
    try {
      document.removeEventListener("info", this.infoUpdate);
    } catch {}
    document.addEventListener("info", this.infoUpdate);
    try {
      document.removeEventListener("info", this.errorUpdate);
    } catch {}
    document.addEventListener("info", this.errorUpdate);
    try {
      document.removeEventListener("info", this.stateUpdate);
    } catch {}
    document.addEventListener("info", this.stateUpdate);
    try {
      document.removeEventListener("rts", this.dataSlowUpdate);
    } catch {}
    document.addEventListener("rts", this.dataSlowUpdate);
    try {
      document.removeEventListener("rtf", this.dataFastUpdate);
    } catch {}
    document.addEventListener("rtf", this.dataFastUpdate);
    try {
      document.removeEventListener("data", this.dataUpdate);
    } catch {}
    document.addEventListener("data", this.dataUpdate);


  }
})
</script>
<style scoped>
.headerCustomStyle {
  height: 30px !important;
  display: flex;
  align-items: center !important;
}
.footerCustomStyle {
  height: 30px !important;
  display: flex;
  align-items: center !important;
}
</style>
