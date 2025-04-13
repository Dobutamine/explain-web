<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="q-mt-es row gutter text-overline justify-center"
      @click="isEnabled = !isEnabled"
    >
      {{ title }}
    </div>
    <div v-if="isEnabled">
      <div class="q-ma-sm q-gutter-xs row items-center">
        <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-green"
            :style="{ 'font-size': '10px' }"
          >
            Heart rate (/min)
          </div>
          <div class="text-green" :style="{ 'font-size': '32px' }">
            {{ hr }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-purple-12"
            :style="{ 'font-size': '10px' }"
          >
            SpO2 pre (%)
          </div>
          <div class="text-purple-12" :style="{ 'font-size': '32px' }">
            {{ spo2_pre }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-purple-11"
            :style="{ 'font-size': '10px' }"
          >
            SpO2 post (%)
          </div>
          <div class="text-purple-11" :style="{ 'font-size': '32px' }">
            {{ spo2_post }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-white"
            :style="{ 'font-size': '10px' }"
          >
            Resp rate (/min)
          </div>
          <div class="text-white" :style="{ 'font-size': '32px' }">
            {{ rr }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-red-12"
            :style="{ 'font-size': '10px' }"
          >
            ABP (mmHg)
          </div>
          <div class="text-red-12 row" :style="{ 'font-size': '32px' }">
            {{ abp }}
            <div
              class="q-ma-sm q-mt-md text-red-12"
              :style="{ 'font-size': '12px' }"
            >
              {{ abp_mean }}
            </div>
          </div>
        </div>
        <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-yellow-12"
            :style="{ 'font-size': '10px' }"
          >
            PAP (mmHg)
          </div>
          <div class="text-yellow-12 row" :style="{ 'font-size': '32px' }">
            {{ pap }}
            <div
              class="q-ma-sm q-mt-md text-yellow-12"
              :style="{ 'font-size': '12px' }"
            >
              {{ pap_mean }}
            </div>
          </div>
        </div>
        <!-- <div class="q-mr-sm">
          <div
            class="q-mr-sm text-left text-green"
            :style="{ 'font-size': '12px' }"
          >
            Temp (dgs C)
          </div>
          <div class="text-green" :style="{ 'font-size': '46px' }">
            {{ temp }}
          </div>
        </div> -->
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";

export default {
  data() {
    return {
      isEnabled: true,
      title: "VITALS",
      currentData: {},
      mutableParameters: [],
      hr: "-",
      spo2_pre: "-",
      spo2_post: "-",
      spo2_ven: "-",
      abp: "-/-",
      abp_mean: "(-)",
      pap: "-/-",
      pap_mean: "(-)",
      rr: "-",
      etco2: "-",
      temp: "-",
    };
  },
  methods: {
    dataUpdate() {
      if (!this.isEnabled) return;

      this.currentData =
        explain.modelDataSlow[explain.modelDataSlow.length - 1];

      if (this.currentData) {
        try {
          this.hr = this.currentData["Monitor.heart_rate"].toFixed(0);
          this.spo2_pre = this.currentData["Monitor.spo2_pre"].toFixed(0);
          this.spo2_post = this.currentData["Monitor.spo2"].toFixed(0);
          this.spo2_ven = this.currentData["Monitor.spo2_ven"].toFixed(0);
          this.abp =
            this.currentData["Monitor.abp_pre_syst"].toFixed(0) +
            "/" +
            this.currentData["Monitor.abp_pre_diast"].toFixed(0);
          this.abp_mean =
            "(" + this.currentData["Monitor.abp_pre_mean"].toFixed(0) + ")";
          this.pap =
            this.currentData["Monitor.pap_syst"].toFixed(0) +
            "/" +
            this.currentData["Monitor.pap_diast"].toFixed(0);
          this.pap_mean =
            "(" + this.currentData["Monitor.pap_mean"].toFixed(0) + ")";
          this.rr = this.currentData["Monitor.resp_rate"].toFixed(0);
          this.temp = this.currentData["Monitor.temp"].toFixed(1);
        } catch {}
      }
    },
  },
  beforeUnmount() {},
  mounted() {
    this.isEnabled = !this.collapsed;

    // get the realtime slow data
    this.$bus.on("rts", () => {
      this.dataUpdate();
    });

    // get the slow data from a calculation frame
    this.$bus.on("state", () => {
      this.dataUpdate();
    });

    // when the model is ready built the watchlist for this controller
    this.$bus.on("model_ready", () => {
      explain.watchModelPropsSlow([
        "Monitor.heart_rate",
        "Monitor.resp_rate",
        "Monitor.spo2",
        "Monitor.spo2_pre",
        "Monitor.spo2_ven",
        "Monitor.abp_pre_syst",
        "Monitor.abp_pre_diast",
        "Monitor.abp_pre_mean",
        "Monitor.pap_syst",
        "Monitor.pap_diast",
        "Monitor.pap_mean",
        "Monitor.temp",
      ]);
    });
  },
};
</script>

<style></style>
