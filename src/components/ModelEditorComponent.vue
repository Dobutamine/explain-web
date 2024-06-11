<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <!-- add model part -->
      <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
        <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        </div>
        <div>
          <div class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center row">
            <q-select class="q-pa-xs col" v-model="selectedModelType" style="font-size: 12px" square
              label="add new model" hide-hint :options="availableModelTypes" dense dark stack-label
              @update:model-value="addNewModel" />
            <q-btn v-if="selectedModelType" class="col-1 q-ma-xs q-mt-sm" color="grey-9" size="xs" dense
              icon="fa-solid fa-xmark" @click="cancelAddModel" style="font-size: 8px"><q-tooltip>clear model
                editor</q-tooltip></q-btn>
          </div>
          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(field, index) in selectedNewModelProps" :key="index">
              <!-- boolean -->
              <div v-if="field.type == 'boolean'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-white row" :style="{ 'font-size': '12px' }">
                  <div class="col">
                    {{ field.caption }}
                  </div>
                  <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                    <q-toggle v-model="field.value" color="primary" size="sm"
                      @update:model-value="changePropState(field, arg)" hide-hint filled dense style="font-size: 12px"
                      class="q-mb-sm">
                    </q-toggle>
                  </div>
                </div>
              </div>

            </div>
            <div v-for="(field, index) in selectedNewModelProps" :key="index">
              <!-- number -->
              <div v-if="field.type == 'number'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input v-model="field.value" :label="field.caption" :max="field.ul" :min="field.ll"
                      :step="field.delta" color="blue" hide-hint filled dense stack-label type="number"
                      @update:model-value="changePropState(field, arg)" style="font-size: 12px" class="q-mb-sm" squared>
                    </q-input>
                  </div>
                </div>
              </div>

              <!-- string -->
              <div v-if="field.type == 'string'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input v-model="field.value" :label="field.caption" color="blue"
                      @update:model-value="changePropState(field, arg)" hide-hint filled dense stack-label
                      style="font-size: 12px" class="q-mb-sm" squared>
                    </q-input>
                  </div>
                </div>
              </div>
              <!-- list -->
              <div v-if="field.type == 'list'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-select v-model="field.value" :label="field.caption" :options="field.choices"
                      @update:model-value="changePropState(field, arg)" color="blue" hide-hint filled dense stack-label
                      style="font-size: 12px" class="q-mb-sm" squared>
                    </q-select>
                  </div>
                </div>
              </div>
              <!-- multiple list -->
              <div v-if="field.type == 'multiple-list'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  {{ field.caption }}
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-select v-model="field.value" :label="field.caption" :options="field.choices"
                      @update:model-value="changePropState(field, arg)" multiple color="blue" hide-hint filled dense
                      stack-label style="font-size: 12px" class="q-mb-sm" squared>
                    </q-select>
                  </div>
                </div>
              </div>
            </div>
            <!-- error message -->
            <div v-if="newModelErrorFlag" :class="newModelErrorClass" :style="{ 'font-size': '12px' }">
              {{ newModelErrorMessage }}
            </div>
            <div v-if="selectedNewModelProps.length > 0" class="row q-ma-sm">
              <q-btn class="col q-ma-sm" color="primary" size="xs" dense icon="fa-solid fa-add"
                @click="addNewModelToEngine" style="font-size: 10px"><q-tooltip>add new model</q-tooltip></q-btn>
              <q-btn class="col q-ma-sm" color="negative" size="xs" dense icon="fa-solid fa-cancel"
                @click="cancelAddModel" style="font-size: 10px"></q-btn>
            </div>

          </div>
        </div>
      </q-card>

      <!-- edit model part -->
      <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
        <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        </div>
        <div>
          <div class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center row">
            <q-select class="q-pa-xs col" v-model="selectedModelName" square label="edit existing model" hide-hint
              :options="modelNames" dense dark stack-label @update:model-value="modelChanged" />
            <q-btn v-if="selectedModelName" class="col-1 q-ma-xs q-mt-sm" color="grey-9" size="xs" dense
              icon="fa-solid fa-xmark" @click="cancel" style="font-size: 8px"><q-tooltip>clear model
                editor</q-tooltip></q-btn>
          </div>


          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(field, index) in selectedModelProps" :key="index">

              <div v-if="field.type == 'number'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input v-model="field.value" :label="field.caption" :max="field.ul" :min="field.ll"
                      :step="field.delta" color="blue" hide-hint filled dense
                      @update:model-value="changePropState(field, arg)" stack-label type="number"
                      style="font-size: 12px" class="q-mb-sm" squared>
                    </q-input>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'boolean'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '12px' }">
                  <div class="col">
                    {{ field.caption }}
                  </div>
                  <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                    <q-toggle v-model="field.value" color="primary" size="sm" hide-hint filled dense
                      @update:model-value="changePropState(field, arg)" style="font-size: 12px" class="q-mb-sm">
                    </q-toggle>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'string'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input v-model="field.value" :label="field.caption" color="blue" hide-hint filled dense
                      @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                      class="q-mb-sm" squared>
                    </q-input>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'list'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-select v-model="field.value" :label="field.caption" :options="field.choices" color="blue"
                      hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                      style="font-size: 12px" class="q-mb-sm" squared>
                    </q-select>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'multiple-list'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-select v-model="field.value" :label="field.caption" :options="field.choices" multiple
                      color="blue" hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                      style="font-size: 12px" class="q-mb-sm" squared>
                    </q-select>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'function'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  {{ field.caption }}
                </div>
                <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                  <!-- <div class="q-ml-md q-mr-md text-left text-white" :style="{ 'font-size': '10px' }">
                        {{ arg.caption }}
                    </div> -->
                  <div v-if="arg.type == 'number' && !arg.hidden">
                    <q-input v-model.number="arg.value" :label="arg.caption" type="number" :max="arg.ul" :min="arg.ll"
                      :step="arg.delta" color="blue" hide-hint filled dense
                      @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm" squared>
                    </q-input>
                  </div>
                  <div v-if="arg.type == 'boolean' && !arg.hidden" class="q-ml-sm col-1">
                    <q-toggle v-model="arg.value" :label="arg.caption" color="primary" size="xs" hide-hint filled dense
                      @update:model-value="changePropState(field, arg)" style="font-size: 10px"
                      class="q-ml-md q-mt-xs q-mb-sm">
                    </q-toggle>
                  </div>
                  <div v-if="arg.type == 'string' && !arg.hidden">
                    <q-input v-model="arg.value" :label="arg.caption" color="blue" hide-hint filled dense
                      @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm" squared>
                    </q-input>
                  </div>
                  <div v-if="arg.type == 'list' && !arg.hidden">
                    <q-select v-model="arg.value" :label="arg.target" :options="arg.choices" color="blue" hide-hint
                      filled dense @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm" squared>
                    </q-select>
                  </div>
                  <div v-if="arg.type == 'multiple-list' && !arg.hidden">
                    <q-select v-model="arg.value" :options="arg.choices" :label="arg.target" multiple color="blue"
                      hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                      style="font-size: 12px" class="q-ml-md q-mr-md q-mb-sm" squared>
                    </q-select>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedModelName && state_changed" class="row q-ma-md">

            <q-select label-color="white" class="q-ml-md q-mr-md col" v-model="changeInTime" :options="timeOptions"
              label="apply changes in (sec)" style="font-size: 12px" hide-hint dense dark stack-label />
            <q-btn class="col-4 q-ma-sm" color="negative" size="xs" dense icon="fa-solid fa-play" @click="updateValue"
              style="font-size: 8px"><q-tooltip>apply property changes</q-tooltip></q-btn>
          </div>


        </div>
      </q-card>
    </div>

  </q-card>
</template>

<script>

import { explain } from "../boot/explain";


export default {
  setup() {
    let selectedModelProps = []
    let selectedNewModelProps = []

    return {
      selectedModelProps, selectedNewModelProps
    }
  },
  data() {
    return {
      title: "MODEL EDITOR",
      collapsed: false,
      isEnabled: true,
      redraw: 1,
      availableModelTypes: [],
      selectedModelType: "",
      selectedNewModelPropsChoices: [],
      showNewModelInDiagram: false,
      newModelErrorFlag: false,
      noNewModelError: "q-ml-md q-mr-md q-mt-md text-secondary text-center",
      newModelError: "q-ml-md q-mr-md q-mt-md text-negative text-center",
      newModelErrorClass: "q-ml-md q-mr-md q-mt-md text-secondary text-center",
      newModelErrorMessage: "no error",
      modelTypes: ["BloodCapacitance", "BloodTimeVaryingElastance", "BloodResistor", "BloodValve", "BloodDiffusor", "BloodPump", "GasCapacitance"],
      selectedModelName: "",
      show_optionals: false,
      show_relatives: false,
      optionals_caption: "SHOW ADVANCED",
      optionals_color: "grey-9",
      optionals_text: "show advanced properties",
      relatives_caption: "SHOW RELATIVES",
      relatives_color: "grey-9",
      relatives_text: "show relative properties",
      modelNames: [],
      timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
      changeInTime: 5,
      state_changed: false,
      collaps_icon: "fa-solid fa-chevron-up"
    };
  },
  methods: {
    cancelAddModel() {
      this.selectedModelType = ""
      this.resetNewModel()
    },
    addNewModelToEngine() {
      this.newModelErrorFlag = false
      this.selectedNewModelProps.forEach(prop => {
        if (prop.target == "name" && prop.value == "") {
          this.newModelErrorFlag = true
          this.newModelErrorClass = this.newModelError
          this.newModelErrorMessage = "name is missing"
        }
        if (prop.target == "name" && this.modelNames.includes(prop.value)) {
          this.newModelErrorFlag = true
          this.newModelErrorClass = this.newModelError
          this.newModelErrorMessage = "this is name is already in use"
        }
      })

      if (this.newModelErrorFlag) return

      // convert the properties to a dictionary which the model engine can understand
      let new_model = {
        model_type: this.selectedModelType
      }
      // add the properties
      this.selectedNewModelProps.forEach(prop => {
        if (prop.type !== 'function') {
          new_model[prop.target] = prop.value
          if (prop.type == 'number') {
            new_model[prop.target] = parseFloat(prop.value / prop.factor)
          }
        }

      })
      // set to the model for processing
      explain.addNewModelToEngine(this.selectedModelType, new_model)

      // send the model to the diagram editor for rendering
      if (this.showNewModelInDiagram) {
        this.$bus.emit("addNewModelToDiagram", new_model)
      }

      this.resetNewModel()
      this.selectedModelType = ""
    },
    resetNewModel() {
      this.selectedNewModelProps = []
      this.newModelErrorClass = this.noNewModelError
      this.newModelErrorFlag = false
      this.redraw += 1
    },
    addNewModel() {
      // reset the new model properties
      this.resetNewModel()

      // get the model interface of the selected model
      explain.getModelInterface(this.selectedModelType)
    },
    processModelInterface(model_type, model_props) {
      console.log("received model interface of ", model_type)
      console.log(model_props)
      // we have to convert the model properties to a format which the editor can understand, this is an array of objects and store in selectedNewModelProps
      // clear the current selectedNewModelProps holding the new model properties
      this.selectedNewModelProps = []
      // add a new name and description field
      this.selectedNewModelProps.push({
        "caption": "name",
        "target": "name",
        "type": "string",
        "value": "",
      })
      this.selectedNewModelProps.push({
        "caption": "description",
        "target": "description",
        "type": "string",
        "value": "",
      })
      // process the model interface
      model_props.forEach(prop => {
        if (prop.type == 'number') {
          prop['value'] = prop['default'] * prop['factor']
        } else {
          prop['value'] = prop['default']
        }
        // if the property is a list then add the options to the choices
        if (prop.type == 'list') {
          prop['choices'] = []
          if (prop['option_default']) {
            prop['choices'] = prop['options_default']
          }
          if (prop.options) {
            Object.values(explain.modelState.models).forEach(model => {
              if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
            })

          }
        }
        if (prop.type == 'multiple-list') {
          prop['choices'] = []
          if (prop['option_default']) {
            prop['choices'] = prop['options_default']
          }
          if (prop.options) {
            Object.values(explain.modelState.models).forEach(model => {
              if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
            })
          }
        }
        this.selectedNewModelProps.push(prop)
      })
      this.redraw += 1


    },
    collapsEditor() {

      if (this.isEnabled) {
        this.isEnabled = false
        this.collaps_icon = "fa-solid fa-chevron-up"
      } else {
        this.isEnabled = true
        this.collaps_icon = "fa-solid fa-chevron-down"
      }
    },
    changeNewPropState(param, arg) {
      this.state_changed = true
      param.state_changed = true
      this.redraw += 1
    },
    changePropState(param, arg) {
      this.state_changed = true
      param.state_changed = true
      this.redraw += 1

    },
    updateValue() {
      this.selectedModelProps.forEach(prop => {
        if (prop.state_changed) {
          if (prop.type == 'function') {
            let function_name = this.selectedModelName + "." + prop.target;
            let function_args = []
            prop.args.forEach(arg => {
              if (arg.type == 'number') {
                function_args.push(arg.value / arg.factor)
              } else {
                function_args.push(arg.value)
              }
            })
            explain.callModelFunction(function_name, function_args)
          }

          if (prop.type == 'number') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'boolean') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, prop.value, 0, 0)
          }
          if (prop.type == 'string') {
            let new_value = prop.value
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'list') {
            let new_value = prop.value
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'multiple-list') {
            let new_value = prop.value
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
      this.collaps_icon = "fa-solid fa-chevron-down"
      this.state_changed = false
      this.selectModel()
      explain.getModelState()
    },
    selectModel() {
      // copy, don't reference the interfacing items
      this.selectedModelProps = [...Object.values(explain.modelState.models[this.selectedModelName].model_interface)]
      // add a flag to the property which can be set when the property needs to be updated
      this.selectedModelProps.forEach(param => {
        param['state_changed'] = false

        // get the current value
        let f = param.target.split('.')
        if (f.length == 1) {
          param['value'] = explain.modelState.models[this.selectedModelName][f[0]]
        }
        if (f.length == 2) {
          param['value'] = explain.modelState.models[this.selectedModelName][f[0]][f[1]]
        }
        if (f.length == 3) {
          param['value'] = explain.modelState.models[this.selectedModelName][f[0]][f[1]][f[2]]
        }

        // round the number
        if (param.type == 'number') {
          param['value'] = (param['value'] * param.factor).toFixed(param.rounding)
        }

        if (param.options) {
          if (param.type == 'list') {
            // if there's a default number then use it
            if (param['default']) {
              param['value'] = param['default']
            }
            // file the options list
            param['choices'] = []
            if (param['option_default']) {
              param['choices'] = param['options_default']
            }
            Object.values(explain.modelState.models).forEach(model => {
              if (param.options.includes(model.model_type)) {
                param["choices"].push(model.name)
              }
            })
          }
          if (param.type == 'multiple-list') {
            if (param['default']) {
              param['value'] = param['default']
            }
            // file the options list
            param['choices'] = []
            if (param['option_default']) {
              param['choices'] = param['options_default']
            }
            Object.values(explain.modelState.models).forEach(model => {
              if (param.options.includes(model.model_type)) {
                param["choices"].push(model.name)
              }
            })
          }
        }

        if (param.type == 'function') {
          param.args.forEach(arg => {
            if (!arg['hidden']) {
              arg['hidden'] = false
            }
            // get the current value
            let f = arg.target.split('.')
            if (f.length == 1) {
              arg['value'] = explain.modelState.models[this.selectedModelName][f[0]]
            }
            if (f.length == 2) {
              arg['value'] = explain.modelState.models[this.selectedModelName][f[0]][f[1]]
            }
            if (f.length == 3) {
              arg['value'] = explain.modelState.models[this.selectedModelName][f[0]][f[1]][f[2]]
            }

            if (arg.target) {
              if (arg.type == 'number') {
                arg['value'] = (arg['value'] * arg.factor).toFixed(arg.rounding)
              }
              if (isNaN(arg['value'])) {
                arg['value'] = arg.default
              }
              if (arg.options) {
                if (arg.type == 'list') {
                  arg['choices'] = []
                  if (arg['options_default']) {
                    arg['choices'] = arg['options_default']
                  }
                  arg['value'] = explain.modelState.models[this.selectedModelName][arg.target]
                  if (arg['default']) {
                    arg['value'] = arg['default']
                  }
                  Object.values(explain.modelState.models).forEach(model => {
                    if (arg.options.includes(model.model_type)) {
                      arg["choices"].push(model.name)
                    }
                  })
                }
                if (arg.type == 'multiple-list') {
                  arg['choices'] = []
                  if (arg['options_default']) {
                    arg['choices'] = arg['options_default']
                  }
                  arg['value'] = explain.modelState.models[this.selectedModelName][arg.target]
                  if (arg['default']) {
                    arg['value'] = arg['default']
                  }
                  Object.values(explain.modelState.models).forEach(model => {
                    if (arg.options.includes(model.model_type)) {
                      arg["choices"].push(model.name)
                    }
                  })
                }
              }
            }
          })
        }
      })
      console.log(this.selectedModelProps)
      this.redraw += 1

    },
    processAvailableModels() {
      this.modelNames = []
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          this.selectModel()
        }
      } catch { }
    },
    processAvailableModelTypes(data) {
      this.availableModelTypes = data
    },

  },
  beforeUnmount() {
    this.state_changed = false
    document.removeEventListener("model_interface", (data) => { this.processModelInterface(data.model_type, data.model_props) });
    document.removeEventListener("model_types", (data) => { this.processAvailableModelTypes(data.model_types) });
  },
  mounted() {
    try {
      document.removeEventListener("model_interface", (data) => { this.processModelInterface(data.model_type, data.model_props) });
    } catch { }
    document.addEventListener("model_interface", (data) => { this.processModelInterface(data.model_type, data.model_props) });

    try {
      document.removeEventListener("model_types", (data) => { this.processAvailableModelTypes(data.model_types) });
    } catch { }
    document.addEventListener("model_types", (data) => { this.processAvailableModelTypes(data.model_types) });

    // get all available model types
    explain.getModelTypes()

    // update if state changes
    this.$bus.on("state", this.processAvailableModels)

  },
};
</script>

<style></style>
