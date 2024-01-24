<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="q-mt-es row gutter text-overline justify-center"
      @click="isEnabled = !isEnabled"
    >
      {{ title }}
    </div>
    <div v-if="isEnabled">
      <div
        class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center"
      >
        <q-select
          class="q-pa-xs row"
          v-model="selectedModelName"
          square
          label="select model"
          hide-hint
          :options="modelNames"
          dense
          dark
          stack-label
          @update:model-value="selectModel"
        />
      </div>
      <div class="q-ma-sm">
        <div v-for="(field, index) in selectedModelProps" :key="index">
          <div v-if="field.type == 'number'">
            <div class="q-ml-md q-mr-md text-left text-secondary" :style="{ 'font-size': '14px' }">
              {{ field.name }}
            </div>
            <q-input
              v-model="field.value"
              color="blue"
              hide-hint
              filled
              dense
              stack-label
              type="number"
              style="font-size: 14px"
              class="q-ml-md q-mr-md"
              squared>
            </q-input>
          </div>
        </div>
      </div>
      <div class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
        <q-btn
          color="negative"
          size="xs"
          dense
          style="width: 70px"
          icon="fa-solid fa-xmark"
          @click="cancel"
        ></q-btn>
        <q-btn
          color="primary"
          size="sm"
          style="width: 70px"
          icon="fa-solid fa-check"
          @click="updateValue"
          ></q-btn
        >

      </div>

    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";


export default {
  props: {
    parameters: Array
  },
  data() {
    return {
      title: "SUBMODEL EDITOR",
      isEnabled: true,
      selectedModelName: "",
      selectedModelProps: [],
      modelNames: []
    };
  },
  methods: {
    updateValue() {
      this.selectedModelProps.forEach((p) => {
        if (p.type === 'number') {
          let v = parseFloat(p.value / p.factor);
          let prop = this.selectedModelName + "." + p.name;
          explain.setPropValue(prop, v)
        }
      })

    },
    cancel() {
      this.selectedModelName = ""
      this.selectedModelProps = {}
    },
    selectModel () {
      this.selectedModelProps = {}

      this.selectedModelProps = Object.values(explain.modelState.models[this.selectedModelName].independent_parameters)
      // fill the values
      this.selectedModelProps.forEach(param => {
        param['value'] =  explain.modelState.models[this.selectedModelName][param.name] * param.factor;
      })
      console.log(this.selectedModelProps)
    },
    getAvailableModels() {
      explain.getModelState()
    },
    processAvailableModels() {
      this.modelNames = []
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          this.selectedModelName = this.modelNames[0]
          this.selectModel()
      }
      } catch {}
    }
  },
  beforeUnmount() {
  },
  mounted() {
    this.$bus.on("state", this.processAvailableModels)

    explain.getModelState()

  },
};
</script>

<style></style>
