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

      <div v-if="redraw > 0.0" class="q-ma-sm">
        <div v-for="(field, index) in selectedModelProps" :key="index">

          <div v-if="field.type == 'number'">
            <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '14px' }">
                {{ field.caption }}
              <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                <div v-if="arg.required == true" class="text-white" :style="{ 'font-size': '10px' }">
                  <q-input
                    v-model="arg.value"
                    :max="arg.ul"
                    :min="arg.ll"
                    :step="arg.delta"
                    color="blue"
                    hide-hint
                    filled
                    dense
                    @update:model-value="changePropState(field, arg)"
                    stack-label
                    type="number"
                    style="font-size: 14px"
                    class="q-mr-md q-mb-sm"
                    squared>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <div v-if="field.type == 'string'">
            <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '14px' }">
                {{ field.caption }}
              <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                <div v-if="arg.required == true" class="text-white" :style="{ 'font-size': '10px' }">
                  <q-input
                    v-model="arg.value"
                    color="blue"
                    hide-hint
                    filled
                    dense
                    @update:model-value="changePropState(field, arg)"
                    stack-label
                    style="font-size: 14px"
                    class="q-mr-md q-mb-sm"
                    squared>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <div v-if="field.type == 'boolean'">
            <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '14px' }">
              <div class="col">
                {{ field.caption }}
              </div>
              <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                <div v-if="arg.required == true" class="text-white col" :style="{ 'font-size': '10px' }">
                  <q-toggle
                    v-model="arg.value"
                    color="primary"
                    size="sm"
                    hide-hint
                    filled
                    dense
                    @update:model-value="changePropState(field, arg)"
                    style="font-size: 14px"
                    class="q-mr-md q-mb-sm">
                  </q-toggle>
                </div>
              </div>
            </div>
          </div>

          <div v-if="field.type == 'function'">
            <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '14px' }">
              {{ field.caption }}
            </div>
            <div v-if="show_current_value" class="q-ml-md q-mr-md q-mb-sm text-left text-grey" :style="{ 'font-size': '10px' }">
              current {{ field.target }} = {{  field.value }}
            </div>

            <div v-for="(arg, index_arg) in field.args" :key="index_arg">
              <div v-if="arg.required == true" class="q-ml-md q-mr-md text-left text-white" :style="{ 'font-size': '10px' }">
                {{ arg.caption }}
              </div>
              <div v-if="arg.type == 'number' && arg.required == true">
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
              <div v-if="arg.type == 'string' && arg.required == true">
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

            <div v-if="show_optionals">
              <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                <div v-if="arg.required == false" class="q-ml-md q-mr-md text-left text-white" :style="{ 'font-size': '10px' }">
                  {{ arg.caption }}
                </div>
                <div v-if="arg.type == 'number' && arg.required == false">
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
                <div v-if="arg.type == 'string' && arg.required == false">
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


          <div class="row justify-end q-mr-md">
              <q-btn :color="optionals_color" dense size="xs" @click="showOptionals(field)">{{ optionals_caption }}</q-btn>
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
      redraw: 1,
      selectedModelName: "",
      show_optionals: false,
      optionals_caption: "SHOW OPTIONALS",
      optionals_color: "negative",
      modelNames: [],
      changeInTime: 5,
      show_current_value: true
    };
  },
  methods: {
    changePropState(param, arg) {
      param.state_changed = true
      this.redraw += 1

    },
    showOptionals(param) {
      if (this.show_optionals == true) {
        this.show_optionals = false
        this.optionals_caption = "SHOW OPTIONALS"
        this.optionals_color = "negative"
      } else {
        this.show_optionals = true
        this.optionals_caption = "HIDE OPTIONALS"
        this.optionals_color = "primary"
      }
    },
    updateValue() {
      this.selectedModelProps.forEach(prop => {
        if (prop.state_changed) {
          if (prop.type == 'function') {
            let function_name = this.selectedModelName + "." + prop.name;
            let function_args = []
            prop.args.forEach(arg => {
              function_args.push(arg.value)
            })
            explain.callModelFunction(function_name, function_args)
          }

          if (prop.type == 'number') {
            let p = this.selectedModelName + "." + prop.name
            explain.setPropValue(p, parseFloat(prop.args[0].value), parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'boolean') {
            let p = this.selectedModelName + "." + prop.name
            explain.setPropValue(p, prop.args[0].value, 0, 0)
          }
          if (prop.type == 'string') {
            let p = this.selectedModelName + "." + prop.name
            explain.setPropValue(p, prop.args[0].value, 0, 0)
          }
        }
        prop.state_changed = false
      })

      this.show_current_value = false

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
        if (param.type == 'number') {
          param.args[0].value = explain.modelState.models[this.selectedModelName][param.target]
        }
        if (param.type == 'boolean') {
          param.args[0].value = explain.modelState.models[this.selectedModelName][param.target]
        }
        if (param.type == 'string') {
          param.args[0].value = explain.modelState.models[this.selectedModelName][param.target]
        }

        if (param.target) {
          param['value'] = explain.modelState.models[this.selectedModelName][param.target]
        }
        param['show_optionals'] = false
        param['state_changed'] = false
      })
      this.show_current_value = true
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
