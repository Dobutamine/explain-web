<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="q-mt-es row gutter text-overline justify-center"
      @click="isEnabled = !isEnabled"
    >
    </div>
    <div>
      <div
        class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center row"
      >
        <q-select
          class="q-pa-xs col"
          v-model="selectedModelName"
          square
          label="select model"
          hide-hint
          :options="modelNames"
          dense
          dark
          stack-label
          @update:model-value="modelChanged"
        />
        <q-btn
          v-if="selectedModelName"
          class="col-1 q-ma-sm"
          color="grey-9"
          size="xs"
          dense
          :icon="collaps_icon"
          @click="collapsEditor"
          style="font-size: 8px"
        ></q-btn>
        <q-btn
          v-if="selectedModelName && isEnabled"
          class="col-1 q-ma-sm"
          :color="optionals_color"
          size="xs"
          dense
          icon="fa-solid fa-bars"
          @click="showOptionals"
          style="font-size: 8px"
        ><q-tooltip>{{ optionals_text }}</q-tooltip></q-btn>
        <q-btn
          v-if="selectedModelName"
          class="col-1 q-ma-sm"
          color="grey-9"
          size="xs"
          dense
          icon="fa-solid fa-xmark"
          @click="cancel"
          style="font-size: 8px"
        ><q-tooltip>clear model editor</q-tooltip></q-btn>
      </div>
      <div v-if="isEnabled">

      <!-- non optionals -->
      <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
        <div v-for="(field, index) in selectedModelProps" :key="index">
          <div v-if="field.optional == false || show_optionals == true">
            <div v-if="field.type == 'number'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '14px' }">
                  {{ field.caption }}
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input
                        v-model="field.value"
                        :max="field.ul"
                        :min="field.ll"
                        :step="field.delta"
                        color="blue"
                        hide-hint
                        filled
                        dense
                        @update:model-value="changePropState(field, arg)"
                        stack-label
                        type="number"
                        style="font-size: 14px"
                        class="q-mb-sm"
                        squared>
                    </q-input>
                  </div>
              </div>
            </div>

            <div v-if="field.type == 'boolean'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '14px' }">
                  <div class="col">
                    {{ field.caption }}
                  </div>
                  <div class="col-1 text-white" :style="{ 'font-size': '10px' }">
                    <q-toggle
                        v-model="field.value"
                        color="primary"
                        size="sm"
                        hide-hint
                        filled
                        dense
                        @update:model-value="changePropState(field, arg)"
                        style="font-size: 14px"
                        class="q-mb-sm">
                      </q-toggle>
                  </div>
              </div>
            </div>

            <div v-if="field.type == 'string'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '14px' }">
                  {{ field.caption }}
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input
                        v-model="field.value"
                        color="blue"
                        hide-hint
                        filled
                        dense
                        @update:model-value="changePropState(field, arg)"
                        stack-label
                        style="font-size: 14px"
                        class="q-mb-sm"
                        squared>
                      </q-input>
                  </div>
              </div>
            </div>

            <div v-if="field.type == 'function'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '14px' }">
                  {{ field.caption }}
                </div>
                <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                    <div class="q-ml-md q-mr-md text-left text-white" :style="{ 'font-size': '10px' }">
                        {{ arg.caption }}
                    </div>
                    <div v-if="arg.type == 'number'">
                      <q-input
                        v-model.number="arg.value"
                        type="number"
                        :max="arg.ul"
                        :min="arg.ll"
                        :step="arg.delta"
                        color="blue"
                        hide-hint
                        filled
                        dense
                        @update:model-value="changePropState(field, arg)"
                        stack-label
                        style="font-size: 14px"
                        class="q-ml-md q-mr-md q-mb-sm"
                        squared>
                      </q-input>
                    </div>
                    <div v-if="arg.type == 'boolean'" class="col-1">
                      <q-toggle
                          v-model="arg.value"
                          color="primary"
                          size="sm"
                          hide-hint
                          filled
                          dense
                          @update:model-value="changePropState(field, arg)"
                          style="font-size: 14px"
                          class="q-ml-md q-mt-xs q-mb-sm">
                        </q-toggle>
                    </div>
                    <div v-if="arg.type == 'string'">
                      <q-input
                        v-model="arg.value"
                        color="blue"
                        hide-hint
                        filled
                        dense
                        @update:model-value="changePropState(field, arg)"
                        stack-label
                        style="font-size: 14px"
                        class="q-ml-md q-mr-md q-mb-sm"
                        squared>
                      </q-input>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedModelName && state_changed" class="row q-ma-md">

        <q-select
          label-color="white"
          class="q-ml-md q-mr-md col"
          v-model="changeInTime"
          :options="timeOptions"
          label="apply changes in (sec)"
          style="font-size: 12px"
          hide-hint
          dense
          dark
          stack-label
        />
        <q-btn
          class="col-4 q-ma-sm"
          color="negative"
          size="xs"
          dense
          icon="fa-solid fa-play"
          @click="updateValue"
          style="font-size: 8px"
          ><q-tooltip>apply property changes</q-tooltip></q-btn>
      </div>

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
      redraw: 1,
      selectedModelName: "",
      show_optionals: false,
      optionals_caption: "SHOW ADVANCED",
      optionals_color: "grey-9",
      optionals_text: "show advanced properties",
      modelNames: [],
      timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
      changeInTime: 5,
      state_changed: false,
      collaps_icon: "fa-solid fa-chevron-up"
    };
  },
  methods: {
    collapsEditor() {

      if (this.isEnabled) {
        this.isEnabled = false
        this.collaps_icon ="fa-solid fa-chevron-up"
      } else {
        this.isEnabled = true
        this.collaps_icon ="fa-solid fa-chevron-down"
      }

    },
    changePropState(param, arg) {
      this.state_changed = true
      param.state_changed = true
      this.redraw += 1

    },
    showOptionals(param) {
      if (this.show_optionals == true) {
        this.show_optionals = false
        this.optionals_caption = "SHOW ADVANCED"
        this.optionals_text ="show advanced properties"
        this.optionals_color = "grey-9"
      } else {
        this.show_optionals = true
        this.optionals_caption = "HIDE ADVANCED"
        this.optionals_text ="hide advanced properties"
        this.optionals_color = "negative"
      }
    },
    updateValue() {
      this.selectedModelProps.forEach(prop => {
        if (prop.state_changed) {
          if (prop.type == 'function') {
            let function_name = this.selectedModelName + "." + prop.target;
            let function_args = []
            prop.args.forEach(arg => {
              function_args.push(arg.value / arg.factor)
            })
            explain.callModelFunction(function_name, function_args)
          }

          if (prop.type == 'number') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, parseFloat(prop.value / prop.factor) , parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'boolean') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, prop.value, 0, 0)
          }
          if (prop.type == 'string') {
            let new_value = prop.value
            if (prop.value.includes(",")) {
              new_value = prop.value.split(",")
            }
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
        }
        prop.state_changed = false
      })

      this.state_changed = false

    },
    cancel() {
      this.selectedModelName = ""
      this.selectedModelProps = {}
      this.state_changed = false
      explain.getModelState()
    },
    modelChanged() {
      // enable the full control
      this.isEnabled = true
      this.collaps_icon ="fa-solid fa-chevron-down"
      this.state_changed = false
      this.selectModel()
    },
    selectModel () {
      // copy, don't reference the interfacing items
      this.selectedModelProps = [...Object.values(explain.modelState.models[this.selectedModelName].model_interface)]
      // add a flag to the property which can be set when the property needs to be updated
      this.selectedModelProps.forEach(param => {
        param['state_changed'] = false
        if (param.type == 'number') {
          param['value'] = (explain.modelState.models[this.selectedModelName][param.target] * param.factor).toFixed(param.rounding)
        }
        if (param.type == 'boolean') {
          param['value'] = explain.modelState.models[this.selectedModelName][param.target]
        }
        if (param.type == 'string') {
          param['value'] = explain.modelState.models[this.selectedModelName][param.target]
        }

        if (param.type == 'function') {
          param.args.forEach(arg => {
            if (arg.target) {
              arg['value'] = (explain.modelState.models[this.selectedModelName][arg.target] * arg.factor).toFixed(arg.rounding)
            }
          })
        }
      })
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
    this.state_changed = false
  },
  mounted() {
    this.$bus.on("state", this.processAvailableModels)

  },
};
</script>

<style></style>
