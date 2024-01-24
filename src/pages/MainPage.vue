<template>
  <q-page>
    <div class="q-pa-sm">
      <div class="row">
        <div class="col-3">
          <q-tabs
            v-model="tab_left"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            outside-arrows
            @update:model-value="tabLeftChanged"
          >
            <q-tab
                name="actions"
                ><q-icon name="fa-solid fa-location-crosshairs" size="xs"></q-icon
                ><q-tooltip>interventions</q-tooltip>
            </q-tab>
            <q-tab
              name="model_editor"
              ><q-icon name="fa-solid fa-pen-to-square" size="xs"></q-icon
              ><q-tooltip>edit model</q-tooltip>
            </q-tab>
          </q-tabs>
        </div>
        <div class="col-6"></div>
        <div class="col-3">
          <q-tabs
            v-model="tab_right"
            dense
            class="text-white"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            outside-arrows
            @update:model-value="tabRightChanged"
          >
            <q-tab name="vitals">
              <q-icon name="fa-solid fa-keyboard" size="xs"></q-icon>
              <q-tooltip>vital parametyers</q-tooltip>
            </q-tab>
            <q-tab name="patient_monitor">
              <q-icon name="fa-solid fa-desktop" size="xs"></q-icon>
              <q-tooltip>patient monitor</q-tooltip>
            </q-tab>
          </q-tabs>
          <q-tab-panels v-model="tab_right" keep-alive>
            <q-tab-panel name="vitals">
              <q-scroll-area
                class="q-pa-xs"
                dark
                :style="screen_height"
                :vertical-bar-style="{
                  right: '5px',
                  borderRadius: '5px',
                  background: 'grey-10',
                  width: '5px',
                  opacity: 0.5 }">
                  <NumericsComponent
                    :title="vitals_numerics.title"
                    :collapsed="vitals_numerics.collapsed"
                    :data_type="vitals_numerics.data_type"
                    :parameters="vitals_numerics.parameters"></NumericsComponent>

              </q-scroll-area>
            </q-tab-panel>

          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import NumericsComponent from "src/components/NumericsComponent.vue";

export default defineComponent({
  name: 'MainPage',
  setup(){},
  components: {
    NumericsComponent
  },
  data() {
    return {
      tab_left: "actions",
      tab_right: "vitals",
      screen_offset: 10.0,
      screen_height: 100.0,
      vitals_numerics: {
        title: "Vitals",
        collapsed: false,
        parameters: [
          {label: "Heartrate", unit: "/min", factor: 1.0, rounding: 0, props: ["Heart.heart_rate"]},
          {label: "ABP", unit: "mmHg", factor: 1.0, rounding: 0, props: ["AA.pres_max", "AA.pres_min"]},
          {label: "LV_AA", unit: "ml/min", factor: 1000.0, rounding: 0, props: ["LV_AA.flow_lmin"]}]
      }
    }
  },
  methods: {
    tabLeftChanged() {},
    tabRightChanged() {},
    dataSlowUpdate() {
      this.$bus.emit('ds')
    },
    dataFastUpdate() {
      this.$bus.emit('df')
    },
    dataUpdate() {
      this.$bus.emit('data')
    }
  },
  beforeUnmount() {

  },
  mounted() {


    this.$q.dark.set(true);

    let h = this.$q.screen.height - this.screen_offset;
    this.screen_height = "height: " + h + "px";
  }
})
</script>
