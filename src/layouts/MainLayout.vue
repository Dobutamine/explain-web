<template>
  <q-layout view="hHh lpR fFf">
    <q-header
      class="bg-indigo-10 text-white headerCustomStyle"
      height-hint="68"
    >
      <q-toolbar>
        <q-toolbar-title class="text-overline">
          Explanatory models in neonatology - local version (EXPLAIN)
        </q-toolbar-title>

        <div v-if="user.loggedIn" class="text-overline q-ml-sm">
          logged in as: <b>{{ user.name }} </b>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="black-background">
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-8 text-white footerCustomStyle">
      <q-toolbar v-if="user.loggedIn">
        <q-toolbar-title class="text-overline">
          <div>{{ statusMessage }}</div>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="fa-brands fa-python"
          color="white"
          class="q-mr-sm"
          @click="downloadPython"
        >
          <q-tooltip> export staet as python file </q-tooltip></q-btn
        >
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
          icon="fa-solid fa-rotate-right"
          color="white"
          class="q-mr-sm"
          @click="reload"
        >
          <q-tooltip> restart model </q-tooltip></q-btn
        >
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useGeneralStore } from "src/stores/general";
import { useUserStore } from "src/stores/user";
import { useStateStore } from "src/stores/state";
import { explain } from "src/boot/explain";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const user = useUserStore();
    const general = useGeneralStore();
    const state = useStateStore();

    return {
      user,
      general,
      state,
    };
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
      showPopup: false,
      popupTitle: "Popup Title",
      popupClass: "text-h6",
      popupMessage: "popup message",
      showInputPopup: false,
      inputPopupTitle: "Input",
      inputPopupClass: "text-h6",
      showLoadStatePopUp: false,
      showSaveStatePopUp: false,
      selectedState: "",
      sharedStates: false,
      stateList: [],
      userStateList: [],
      sharedStateList: [],
      userInput: "",
      durations: [1, 2, 3, 5, 10, 20, 30, 60, 120, 240, 360, 600, 1200, 1800],
      current_model_definition: "",
      available_model_definitions: [],
    };
  },
  methods: {
    selectModelDefinition() {
      // stop the model
      explain.stop();
      this.rtState = false;
      this.playArmed = false;
      this.butColor = "white";
      this.butIcon = "fa-solid fa-play";
      this.butCaption = "PLAY";
      this.$bus.emit("rt_stop");
      // load the new model definition
      explain.loadBakedInModelDefinition(this.current_model_definition);
    },
    stopRt() {
      if (this.rtState) {
        explain.stop();
        this.rtState = false;
        this.playArmed = false;
        this.butColor = "white";
        this.butIcon = "fa-solid fa-play";
        this.butCaption = "PLAY";
        // get the model state
        explain.getModelState();
        this.$bus.emit("rt_stop");
      }
    },
    download() {
      this.stopRt();
      explain.saveModelState("local");
    },
    downloadPython() {
      this.stopRt();
      explain.saveModelStatePython("local");
    },
    saveState() {
      this.stopRt();
      this.selectedState = this.state.name;
      this.showSaveStatePopUp = true;
    },
    upload() {
      if (this.state.protected) {
        if (this.selectedState !== this.state.name) {
          this.state.protected = false;
        }
      }
      this.state.name = this.selectedState;
      this.showSaveStatePopUp = false;
      explain.saveModelState("server");
    },
    togglePlay() {
      this.rtState = !this.rtState;
      if (this.rtState) {
        this.playArmed = true;
        this.state.saved = false;
        this.selectedDuration = 3;
        explain.start();
        this.butColor = "negative";
        this.butIcon = "fa-solid fa-stop";
        this.butCaption = "STOP";
        this.$bus.emit("rt_start");
      } else {
        explain.stop();
        this.playArmed = false;
        this.butColor = "white";
        this.butIcon = "fa-solid fa-play";
        this.butCaption = "PLAY";
        // get the model state
        explain.getModelState();
        this.$bus.emit("rt_stop");
      }
    },
    reload() {
      explain.restartModelDefinition();
      this.$bus.emit("reset");
    },
    calculate() {
      this.calcRunning = !this.calcRunning;
      if (this.calcRunning) {
        this.butCalcColor = "negative";
        this.state.saved = false;
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
        this.modelName = explain.modelDefinition.name;
        this.modelDescription = explain.modelDefinition.description;
      }
      this.$bus.emit("info");

      if (this.infoMessage.includes("model ready")) {
        this.$bus.emit("reset");
        this.rtState = true;
        this.togglePlay();
        explain.calculate(5);
      }
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
      this.$bus.emit("error");
    },
    statusUpdate() {
      this.$bus.emit("status");
      this.statusMessage = explain.status_message;
      this.calculationReady();
    },
    stateUpdate() {
      this.$bus.emit("state");
    },
    dataSlowUpdate() {
      this.$bus.emit("rts");
    },
    dataFastUpdate() {
      this.$bus.emit("rtf");
    },
    dataUpdate() {
      this.$bus.emit("data");
    },
    submitInput() {
      if (this.userInput.length > 0) {
        this.state.renameState(this.userInput, this.user.name);
      }
      this.showInputPopup = false;
    },
    uploadStateToServer() {
      this.state.model_definition = { ...explain.modelDefinition };
      this.state
        .saveStateToServer(this.general.apiUrl, this.user.name, this.user.token)
        .then((t) => {
          if (t.result) {
            this.popupClass = "text-h6";
            this.$bus.emit("show_popup", {
              title: "Success!",
              message: t.message,
            });
            this.state.saved = true;
          } else {
            this.popupClass = "text-h6 text-negative";
            this.$bus.emit("show_popup", {
              title: "Error!",
              message: t.message,
            });
            this.state.saved = false;
          }
        });
    },
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
    this.$q.dark.set(true);

    // set local user
    this.user.loggedIn = true
    this.user.name = "local user"

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

  },
});
</script>
<style scoped>
.black-background {
  background-color: black;
  min-height: 100vh;
  /* Ensures the background covers the whole page */
}

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
