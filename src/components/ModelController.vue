<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row justify-center">

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
    </div>
  </q-card>
</template>
<script>
import { explain } from "../boot/explain";
import { useStateStore } from "src/stores/state";

export default {
  setup() {
    const state = useStateStore();
    return { state };
  },
  data() {
    return {
      title: "MODEL CONTROLLER",
      collapsed: false,
      display: "block",
      butIcon: "fa-solid fa-play",
      butCaption: "PLAY",
      butColor: "white",
      butCalcColor: "white",
      butCalcIcon: "fa-solid fa-forward-step",
      butCalcCaption: "CALCULATE",
      selectedDuration: 10,
      durations: [1, 2, 3, 5, 10, 20, 30, 60, 120, 240, 360, 600, 1200, 1800],
      rtState: false,
      playArmed: false,
      calcRunning: false,
    };
  },
  methods: {
    toggleShunts() {
      this.shunt_options.forEach((shunt_option) => {
        this.showOrHideShunt(
          this.selected_shunts.includes(shunt_option.value),
          shunt_option.models
        );
      });
    },
    showOrHideShunt(state, shunts) {
      if (state) {
        // show the shunt if not already shown
        shunts.forEach((shunt) => {
          const index_sprite = pixiApp.stage.children.findIndex(
            (obj) => obj.name_sprite == shunt
          );
          if (index_sprite < 0) {
            // not shown already so add it
            this.addDiagramComponent(shunt);
          }
        });
      } else {
        // hide the shunt
        shunts.forEach((shunt) => {
          const index_sprite = pixiApp.stage.children.findIndex(
            (obj) => obj.name_sprite == shunt
          );
          if (index_sprite > 0) {
            // it is present so hide it
            this.removeDiagramComponent(shunt);
          }
        });
      }
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
    statusUpdate() {
      this.$bus.emit("status");
      this.statusMessage = explain.status_message;
      this.calculationReady();
    },
    reload() {},
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
  },
  beforeUnmount() {
    document.removeEventListener("status", this.statusUpdate);
  },
  mounted() {
    try {
      document.removeEventListener("status", this.statusUpdate);
    } catch {}
    document.addEventListener("status", this.statusUpdate);
  },
};
</script>
<style scoped>
#stage {
  width: 100%;
}
</style>
