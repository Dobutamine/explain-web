<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>
    <div v-if="isEnabled">
      <div class="q-ma-sm q-gutter-xs row items-center">
        <div class="q-mr-md">
          <div class="q-mr-sm text-left text-green" :style="{ 'font-size': '12px' }">
            Heart rate (/min)
          </div>
          <div class="text-green" :style="{ 'font-size': '46px' }">
            {{ hr }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-purple-12" :style="{ 'font-size': '12px' }">
            SpO2 pre (%)
          </div>
          <div class="text-purple-12" :style="{ 'font-size': '46px' }">
            {{ spo2_pre }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-purple-11" :style="{ 'font-size': '12px' }">
            SpO2 post (%)
          </div>
          <div class="text-purple-11" :style="{ 'font-size': '46px' }">
            {{ spo2_post }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-white" :style="{ 'font-size': '12px' }">
            Resp rate (/min)
          </div>
          <div class="text-white" :style="{ 'font-size': '46px' }">
            {{ rr }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-red-12" :style="{ 'font-size': '12px' }">
            ABP (mmHg)
          </div>
          <div class="text-red-12 row" :style="{ 'font-size': '46px' }">
            {{ abp }}
            <div class="q-ma-sm q-mt-md text-red-12" :style="{ 'font-size': '28px' }">
              {{ abp_mean }}
            </div>
          </div>
        </div>
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
      abp: "-/-",
      abp_mean: "(-)",
      rr: "-",
      vent_rate: "-",
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
          this.hr = this.currentData["Heart.heart_rate"].toFixed(0)
          this.spo2_pre = this.currentData["Blood.so2_pre"].toFixed(0)
          this.spo2_post = this.currentData["Blood.so2_post"].toFixed(0)
          this.abp = this.currentData["AD.pres_cor_max"].toFixed(0) + "/" + this.currentData["AD.pres_cor_min"].toFixed(0)
          this.abp_mean = "(" + this.currentData["AD.pres_cor_mean"].toFixed(0) + ")"
          this.rr = this.currentData["Breathing.resp_rate"].toFixed(0)
          this.vent_rate = this.currentData["Ventilator.vent_rate"].toFixed(0)
        } catch { }

      }
    },
  },
  beforeUnmount() {
  },
  mounted() {
    this.isEnabled = !this.collapsed;

    // get the realtime slow data
    this.$bus.on("rts", () => {
      this.dataUpdate()
    });

    // get the slow data from a calculation frame
    this.$bus.on("data", () => {
      this.dataUpdate()
    });

  },
};
</script>

<style></style>
