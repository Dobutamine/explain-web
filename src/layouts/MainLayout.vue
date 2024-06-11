<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-indigo-10 text-white headerCustomStyle" height-hint="68">
      <q-toolbar>
        <q-toolbar-title class="text-overline">
          Explanatory models in neonatology (EXPLAIN)
        </q-toolbar-title>

        <div v-if="user.loggedIn" class="text-overline q-ml-sm">
          logged in as: <b>{{ user.name }} </b>
        </div>
        <div v-if="user.admin" class="text-overline q-ml-sm">
          <b>(admin) </b>
        </div>
        <q-btn v-if="user.loggedIn" size="sm" dense color="indigo-10" class="q-ml-sm q-pl-sm q-pr-sm"
          icon="fa-solid fa-right-from-bracket" @click="logOut"><q-tooltip>log out</q-tooltip></q-btn>
        <q-btn v-if="user.admin" size="sm" dense color="indigo-10" class="q-ml-sm q-pl-sm q-pr-sm"
          icon="fa-solid fa-lock"><q-tooltip>admin page</q-tooltip></q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="black-background">
      <router-view />
      <q-dialog v-model="showPopup" persistent>
        <q-card>
          <q-card-section>
            <div :class="popupClass">{{ popupTitle }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ popupMessage }}
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Close" size="sm" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showInputPopup" persistent transition-show="slide-up" transition-hide="slide-down">
        <q-card>
          <q-card-section>
            <div :class="inputPopupClass">{{ inputPopupTitle }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input v-model="userInput" label="new name" filled clearable @keyup.enter="submitInput" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" size="sm" v-close-popup />
            <q-btn flat label="Submit" color="primary" size="sm" @click="submitInput" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showLoadStatePopUp" persistent transition-show="slide-up" transition-hide="slide-down">
        <q-card>
          <q-card-section>
            <div class="text-h6">Select model state from server</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select v-model="selectedState" :options="stateList" label="user states" filled dense />
            <q-checkbox class="q-ma-sm" v-model="sharedStates" label="include shared states" color="primary" dense dark
              size="xs" @update:model-value="toggleSharedStates" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" size="sm" v-close-popup />
            <q-btn flat label="Load" color="primary" size="sm" @click="loadSelectedState" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showSaveStatePopUp" persistent transition-show="slide-up" transition-hide="slide-down">
        <q-card>
          <q-card-section>
            <div class="text-h6">Save model state to server</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input v-model="selectedState" label="state name" filled clearable />
            <q-checkbox class="q-ma-sm" v-model="state.shared" label="shared state" color="primary" dense dark
              size="xs" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" size="sm" v-close-popup />
            <q-btn flat label="Save" color="primary" size="sm" @click="upload" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-container>

    <q-footer class="bg-grey-8 text-white footerCustomStyle">
      <q-toolbar v-if="user.loggedIn">
        <q-toolbar-title class="text-overline">
          <div>{{ statusMessage }}</div>
        </q-toolbar-title>

        <div v-if="!state.protected" class="text-overline" @click="renameState">
          <b>{{ state.name }} </b>
        </div>

        <div v-if="state.protected" class="text-overline" @click="renameState">
          <b>{{ state.name }} (protected) </b>
        </div>

        <div v-if="!state.saved" class="text-overline" @click="renameState">
          <b>*</b>
        </div>

        <q-btn v-if="user.admin && state.protected" flat round dense size="sm" icon="fa-solid fa-lock" color="white"
          class="q-ml-sm" @click="protectState">
          <q-tooltip> state is protected </q-tooltip></q-btn>

        <q-btn v-if="user.admin && !state.protected" flat round dense size="sm" icon="fa-solid fa-lock-open"
          color="white" class="q-ml-sm" @click="protectState">
          <q-tooltip> state is not protected </q-tooltip></q-btn>

        <q-btn v-if="state.default" flat round dense size="sm" icon="fa-solid fa-star" color="white" class="q-ml-sm"
          @click="setStateAsDefault">
          <q-tooltip> current state is the default state </q-tooltip></q-btn>

        <q-btn v-if="!state.default" flat round dense size="sm" icon="fa-regular fa-star" color="white" class="q-ml-sm"
          @click="setStateAsDefault">
          <q-tooltip> set current state as default </q-tooltip></q-btn>

        <q-btn flat round dense size="sm" icon="fa-solid fa-folder" color="white" class="q-ml-sm"
          @click="getAllUserStates">
          <q-tooltip> get states from server </q-tooltip></q-btn>

        <q-btn flat round dense size="sm" icon="fa-solid fa-save" color="white" class="q-mr-sm q-ml-sm"
          @click="saveState">
          <q-tooltip> save model state to server </q-tooltip></q-btn>

        <q-btn flat round dense size="sm" icon="fa-solid fa-file-export" color="white" class="q-mr-sm"
          @click="download">
          <q-tooltip> export model state to disk </q-tooltip></q-btn>

        <q-btn flat round dense size="sm" :icon="butIcon" :color="butColor" class="q-mr-sm" @click="togglePlay">
          <q-tooltip> start/stop model </q-tooltip></q-btn>

        <q-btn flat round dense :icon="butCalcIcon" size="sm" @click="calculate" :color="butCalcColor" class="q-mr-sm">
          <q-tooltip> fast forward model</q-tooltip></q-btn>

        <q-select class="q-ml-md q-mr-md" label-color="white" v-model="selectedDuration" :options="durations"
          hide-bottom-space dense label="step (sec.)" style="width: 90px; font-size: 12px"><q-tooltip> fast forward step
            size</q-tooltip></q-select>


        <q-btn flat round dense size="sm" icon="fa-solid fa-rotate-right" color="white" class="q-mr-sm" @click="reload">
          <q-tooltip> restart model </q-tooltip></q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useGeneralStore } from 'src/stores/general';
import { useUserStore } from 'src/stores/user';
import { useStateStore } from 'src/stores/state';
import { explain } from 'src/boot/explain';
import { TimeScale } from 'chart.js';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const user = useUserStore()
    const general = useGeneralStore()
    const state = useStateStore()

    return {
      user,
      general,
      state
    }
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
      current_model_definition: 'baseline_neonate',
      available_model_definitions: ['default', 'coarctatio_aortae', 'double_outlet_right_ventricle', 'term_fetus', 'hypoplastic_left_heart_syndrome', 'mitral_atresia', 'pulmonary_atresia', 'total_anomalous_venous_connection', 'transposition_of_great_arteries', 'tricuspid_atresia', 'truncus_arteriosus']
    }
  },
  methods: {
    async loadSelectedState() {
      let result = false
      if (this.selectedState.includes("shared")) {
        let stateName = this.selectedState.split(" (shared)")[0]
        result = await this.state.getSharedStateFromServer(this.general.apiUrl, stateName, this.user.token)
        if (result) {
          explain.loadModelDefinition(this.state.model_definition);
        }
      } else {
        result = await this.state.getStateFromServer(this.general.apiUrl, this.user.name, this.selectedState, this.user.token)
      }
      if (result) {
        // console.log("state loaded")
        // console.log(this.state.model_definition)
        explain.loadModelDefinition(this.state.model_definition);
        this.showLoadStatePopUp = false
        this.$bus.emit('reset')
      }
      this.showLoadStatePopUp = false
    },
    toggleSharedStates() {
      this.buildStateList()
    },
    buildStateList() {
      this.selectedState = ""
      this.stateList = [...this.userStateList]
      if (this.sharedStates) {
        this.sharedStateList.forEach((t) => {
          this.stateList.push(t + " (shared)")
        })
      }
    },
    async getAllUserStates() {
      this.stateList = []
      this.userStateList = []
      this.sharedStateList = []

      this.userStateList = await this.state.getAllUserStatesFromServer(this.general.apiUrl, this.user.name, this.user.token)
      this.sharedStateList = await this.state.getAllSharedStatesFromServer(this.general.apiUrl, this.user.name, this.user.token)

      this.buildStateList()
      this.showLoadStatePopUp = true
    },
    protectState() {
      this.state.protected = !this.state.protected
    },
    setStateAsDefault() {
      this.state.default = true
      this.user.defaultState = this.state.name
    },
    logOut() {
      explain.stop();
      this.rtState = false
      this.playArmed = false;
      this.butColor = "white";
      this.butIcon = "fa-solid fa-play";
      this.butCaption = "PLAY";
      this.$bus.emit("rt_stop")
      this.user.logOut()
      this.$router.push("/login");
    },
    uploadDefinition() {
      this.definition.definition = { ...explain.modelDefinition }
      this.definition.name = explain.modelDefinition.name
      this.definition.saveDefinitionToServer(this.general.apiUrl, this.user.name, this.user.token)
    },
    selectModelDefinition() {
      // stop the model
      explain.stop();
      this.rtState = false
      this.playArmed = false;
      this.butColor = "white";
      this.butIcon = "fa-solid fa-play";
      this.butCaption = "PLAY";
      this.$bus.emit("rt_stop")
      // load the new model definition
      explain.loadBakedInModelDefinition(this.current_model_definition)
    },
    stopRt() {
      if (this.rtState) {
        explain.stop();
        this.rtState = false
        this.playArmed = false;
        this.butColor = "white";
        this.butIcon = "fa-solid fa-play";
        this.butCaption = "PLAY";
        // get the model state
        explain.getModelState()
        this.$bus.emit("rt_stop")
      }
    },
    download() {
      this.stopRt()
      explain.saveModelState("local")
    },
    saveState() {
      this.stopRt()
      this.selectedState = this.state.name
      this.showSaveStatePopUp = true
    },
    upload() {
      if (this.state.protected) {
        if (this.selectedState !== this.state.name) {
          this.state.protected = false
        }
      }
      this.state.name = this.selectedState
      this.showSaveStatePopUp = false
      explain.saveModelState("server")
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
        this.state.saved = false
        this.selectedDuration = 3;
        explain.start();
        this.butColor = "negative";
        this.butIcon = "fa-solid fa-stop";
        this.butCaption = "STOP";
        this.$bus.emit("rt_start")
      } else {
        explain.stop();
        this.playArmed = false;
        this.butColor = "white";
        this.butIcon = "fa-solid fa-play";
        this.butCaption = "PLAY";
        // get the model state
        explain.getModelState()
        this.$bus.emit("rt_stop")
      }
    },
    reload() {
      explain.restartModelDefinition();
      this.$bus.emit('reset')
    },
    calculate() {
      this.calcRunning = !this.calcRunning;
      if (this.calcRunning) {
        this.butCalcColor = "negative";
        this.state.saved = false
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

      if (this.infoMessage.includes("model ready")) {
        this.$bus.emit('reset')
        this.rtState = true
        this.togglePlay()
        explain.calculate(5)
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
    },
    submitInput() {
      if (this.userInput.length > 0) {
        this.state.renameState(this.userInput, this.user.name)
      }
      this.showInputPopup = false
    },
    uploadStateToServer() {
      this.state.model_definition = { ...explain.modelDefinition }
      this.state.saveStateToServer(this.general.apiUrl, this.user.name, this.user.token).then((t) => {
        if (t.result) {
          this.popupClass = "text-h6"
          this.$bus.emit('show_popup', { title: "Success!", message: t.message })
          this.state.saved = true;
        } else {
          this.popupClass = "text-h6 text-negative"
          this.$bus.emit('show_popup', { title: "Error!", message: t.message })
          this.state.saved = false
        }
      })
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
    document.removeEventListener("state_saved", this.uploadStateToServer);
    document.removeEventListener("show_popup", (t) => {
      this.popupTitle = t.title
      this.popupMessage = t.message
      this.showPopup = true
    });
  },
  mounted() {
    try {
      document.removeEventListener("status", this.statusUpdate);
    } catch { }
    document.addEventListener("status", this.statusUpdate);
    try {
      document.removeEventListener("state", this.stateUpdate);
    } catch { }
    document.addEventListener("state", this.stateUpdate);
    try {
      document.removeEventListener("info", this.infoUpdate);
    } catch { }
    document.addEventListener("info", this.infoUpdate);
    try {
      document.removeEventListener("info", this.errorUpdate);
    } catch { }
    document.addEventListener("info", this.errorUpdate);
    try {
      document.removeEventListener("info", this.stateUpdate);
    } catch { }
    document.addEventListener("info", this.stateUpdate);
    try {
      document.removeEventListener("rts", this.dataSlowUpdate);
    } catch { }
    document.addEventListener("rts", this.dataSlowUpdate);
    try {
      document.removeEventListener("rtf", this.dataFastUpdate);
    } catch { }
    document.addEventListener("rtf", this.dataFastUpdate);
    try {
      document.removeEventListener("data", this.dataUpdate);
    } catch { }
    document.addEventListener("data", this.dataUpdate);
    try {
      document.removeEventListener("state_saved", this.uploadStateToServer);
    } catch { }
    document.addEventListener("state_saved", this.uploadStateToServer);
    try {
      document.removeEventListener("show_popup", (t) => {
        this.popupTitle = t.title
        this.popupMessage = t.message
        this.showPopup = true
      });
    } catch {
    }

    this.$bus.on('load_new_model', (t) => {
      if (t !== this.current_model_definition) {
        this.current_model_definition = t
        this.selectModelDefinition()
      }
    })

    this.$bus.on('show_popup', (t) => {
      this.popupTitle = t.title
      this.popupMessage = t.message
      this.showPopup = true
    })

  }
})
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
