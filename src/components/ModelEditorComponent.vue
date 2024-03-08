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
              {{ field.name }} {{ field.unit }}
            </div>
            <q-input
              v-model="field.value"
              color="blue"
              hide-hint
              filled
              dense
              @update:model-value="field.changed = true"
              stack-label
              type="number"
              style="font-size: 14px"
              class="q-ml-md q-mr-md q-mb-sm"
              squared>
            </q-input>
          </div>


          <div v-if="field.type == 'boolean'">
            <div class="q-ml-md q-mr-md text-left text-secondary" :style="{ 'font-size': '14px' }">
              {{ field.name }}
            </div>
            <q-toggle
              v-model="field.value"
              color="primary"
              size="sm"
              hide-hint
              filled
              dense
              @update:model-value="field.changed = true"
              style="font-size: 14px"
              class="q-ml-md q-mr-md q-mb-sm">
            </q-toggle>
          </div>


          <div v-if="field.type == 'function'">
            <div class="q-ml-md q-mr-md text-left text-secondary" :style="{ 'font-size': '16px' }">
              {{ field.caption }}
            </div>
            <div class="q-ml-md q-mr-md q-mb-sm text-left text-grey" :style="{ 'font-size': '10px' }">
                current {{ field.target }} = {{  field.value }}
              </div>

            <div v-for="(arg, index_arg) in field.args" :key="index_arg">
              <div v-if="arg.required == true" class="q-ml-md q-mr-md text-left text-white" :style="{ 'font-size': '10px' }">
                {{ arg.caption }}
              </div>
              <div v-if="arg.type == 'number' && arg.required == true">
                <q-input
                  v-model.number="arg.value"
                  :max="arg.ul"
                  :min="arg.ll"
                  :step="arg.delta"
                  color="blue"
                  hide-hint
                  filled
                  dense
                  @update:model-value="arg.state_changed = true"
                  stack-label
                  type="number"
                  style="font-size: 14px"
                  class="q-ml-md q-mr-md q-mb-sm"
                  squared>
                </q-input>
              </div>
            </div>
          </div>


          <div v-if="field.type == 'info'">
            <div class="q-ml-md q-mr-md text-left text-secondary" :style="{ 'font-size': '14px' }">
                {{ field.caption }} = {{ (field.value * field.factor).toFixed(field.rounding) }}
              </div>
          </div>
        </div>
      </div>
      <div v-if="selectedModelProps.length > 0" class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
        <q-input
          label-color="primary"
          class="q-ml-md q-mr-md row"
          v-model="changeInTime"
          square
          type="number"
          label="apply changes in sec."
          style="width: 50%; font-size: 12px"
          hide-hint
          dense
          dark
          stack-label
        />
      </div>
      <div v-if="selectedModelProps.length > 0" class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">

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
  setup() {
    let selectedModelProps = []

    return {
      selectedModelProps
    }
  },
  data() {
    return {
      title: "SUBMODEL EDITOR",
      isEnabled: true,
      selectedModelName: "",

      modelNames: [],
      changeInTime: 5
    };
  },
  methods: {
    updateValue() {
      let update = false
      this.selectedModelProps.forEach((p) => {
        if (p.type === 'number') {
          let v = parseFloat(p.value / p.factor);
          let prop = this.selectedModelName + "." + p.name;
          if (p.changed) {
            update = true;
            explain.setPropValue(prop, v, this.changeInTime)
          }
        }

        if (p.type === 'boolean') {
          let v = p.value;
          let prop = this.selectedModelName + "." + p.name;
          if (p.changed) {
            update = true;
            explain.setPropValue(prop, v)
          }
        }

        if (p.type === 'function') {
          let v = []
          p.arguments.forEach(arg => v.push(parseFloat(arg.value)))
          let f = this.selectedModelName + "." + p.name;
          if (p.changed) {
            update = true;
            explain.callModelFunction(f, v)
          }
        }
      })

      if (update) {
        //explain.calculate(parseInt(this.changeInTime))
      }

    },
    cancel() {
      this.selectedModelName = ""
      this.selectedModelProps = {}
    },
    selectModel () {
      // copy, don't reference the interfacing items
      this.selectedModelProps = [...Object.values(explain.modelState.models[this.selectedModelName].model_interface)]
      // add a flag to the property which can be set when the property needs to be updated
      this.selectedModelProps.forEach(param => {
        if (param.target) {
          param['value'] = explain.modelState.models[this.selectedModelName][param.target]
        }
        param['state_changed'] = false
      })
    },
    getAvailableModels() {
      explain.getModelState()
    },
    processAvailableModels() {
      this.modelNames = []
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          this.selectModel()
      }
      } catch {}
    }
  },
  beforeUnmount() {
  },
  mounted() {
    this.$bus.on("state", this.processAvailableModels)

  },
};
</script>

<style></style>
