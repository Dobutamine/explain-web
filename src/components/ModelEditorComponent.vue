<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div
      class="row text-overline justify-center"
      @click="collapsed = !collapsed"
    >
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <!-- edit model part -->
      <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
        <div
          class="q-mt-es row gutter text-overline justify-center"
          @click="isEnabled = !isEnabled"
        ></div>
        <div>
          <div
            class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center row"
          >
            <q-select
              class="q-pa-xs col"
              v-model="selectedModelName"
              square
              label="edit model properties"
              hide-hint
              :options="modelNames"
              dense
              dark
              stack-label
              @update:model-value="modelChanged"
            />
            <q-btn
              v-if="selectedModelName"
              class="col-1 q-ma-xs q-mt-sm"
              color="grey-9"
              size="xs"
              dense
              icon="fa-solid fa-xmark"
              @click="cancel"
              style="font-size: 8px"
              ><q-tooltip>clear model editor</q-tooltip></q-btn
            >
          </div>

          <div v-if="redraw > 0.0 && selectedModelName" class="q-ma-sm q-mt-md q-mb-md">
            <div
              class="q-ml-md q-mr-md text-left text-white"
              :style="{ 'font-size': '12px' }"
            >
              {{ selectedModelDescription }}
            </div>
            <q-separator class="q-mt-sm"></q-separator>

            <div v-for="(field, index) in selectedModelProps" :key="index">
              <div v-if="field.type == 'number' && !field.hidden">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input v-if="editorMode == 'abs'"
                      v-model="field.value"
                      :label="field.caption + ' (' + field.unit + ')'"
                      :max="field.range[1]"
                      :min="field.range[0]"
                      :step="field.delta"
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      type="number"
                      style="font-size: 12px"
                      class="q-mb-sm"
                      squared
                    ></q-input>
                    <ExplainSlider v-if="editorMode == 'slider'" :initialValue="field.value" :title="field.caption" sliderType="absolute" :range="field.range" :step="field.delta" unit="x" @value-updated="(arg) => onFactorUpdated(field, arg)"></ExplainSlider>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'boolean' && !field.hidden">
                <div
                  class="q-ml-md q-mr-md q-mt-md text-left text-secondary row"
                  :style="{ 'font-size': '12px' }"
                >
                  <div class="col">
                    {{ field.caption }}
                  </div>
                  <div
                    class="col-2 text-white"
                    :style="{ 'font-size': '10px' }"
                  >
                    <q-toggle
                      v-model="field.value"
                      color="primary"
                      size="sm"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      style="font-size: 12px"
                      class="q-mb-sm"
                    >
                    </q-toggle>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'string' && !field.hidden">
                <div
                  class="q-ml-md q-mr-md q-mt-md text-left text-secondary"
                  :style="{ 'font-size': '12px' }"
                >
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-input
                      v-model="field.value"
                      :label="field.caption"
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-mb-sm"
                      squared
                    >
                    </q-input>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'list' && !field.hidden">
                <div
                  class="q-ml-md q-mr-md q-mt-md text-left text-secondary"
                  :style="{ 'font-size': '12px' }"
                >
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-select
                      v-model="field.value"
                      :label="field.caption"
                      :options="field.choices"
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-mb-sm"
                      squared
                    >
                    </q-select>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'multiple-list' && !field.hidden">
                <div
                  class="q-ml-md q-mr-md q-mt-md text-left text-secondary"
                  :style="{ 'font-size': '12px' }"
                >
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <q-select
                      v-model="field.value"
                      :label="field.caption"
                      :options="field.choices"
                      multiple
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-mb-sm"
                      squared
                    >
                    </q-select>
                  </div>
                </div>
              </div>

              <div v-if="field.type == 'function' && !field.hidden">
                <div
                  class="q-ml-md q-mr-md q-mt-md text-left text-secondary"
                  :style="{ 'font-size': '12px' }"
                >
                  {{ field.caption }}
                </div>
                <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                  <!-- <div class="q-ml-md q-mr-md text-left text-white" :style="{ 'font-size': '10px' }">
                        {{ arg.caption }}
                    </div> -->
                  <div v-if="arg.type == 'number' && !arg.hidden">
                    <q-input
                      v-model.number="arg.value"
                      :label="arg.caption"
                      type="number"
                      :max="arg.range[0]"
                      :min="arg.range[1]"
                      :step="arg.delta"
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm"
                      squared
                    >
                    </q-input>
                  </div>
                  <div v-if="arg.type == 'boolean' && !arg.hidden" class="q-ml-sm col-1">
                    <q-toggle
                      v-model="arg.value"
                      :label="arg.caption"
                      color="primary"
                      size="xs"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      style="font-size: 10px"
                      class="q-ml-md q-mt-xs q-mb-sm"
                    >
                    </q-toggle>
                  </div>
                  <div v-if="arg.type == 'string' && !arg.hidden">
                    <q-input
                      v-model="arg.value"
                      :label="arg.caption"
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm"
                      squared
                    >
                    </q-input>
                  </div>
                  <div v-if="arg.type == 'list' && !arg.hidden">
                    <q-select
                      v-model="arg.value"
                      :label="arg.target"
                      :options="arg.choices"
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm"
                      squared
                    >
                    </q-select>
                  </div>
                  <div v-if="arg.type == 'multiple-list' && !arg.hidden">
                    <q-select
                      v-model="arg.value"
                      :options="arg.choices"
                      :label="arg.target"
                      multiple
                      color="blue"
                      hide-hint
                      filled
                      dense
                      @update:model-value="changePropState(field, arg)"
                      stack-label
                      style="font-size: 12px"
                      class="q-ml-md q-mr-md q-mb-sm"
                      squared
                    >
                    </q-select>
                  </div>
                  <div v-if="arg.type == 'factor'">
                    <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                      <div class="text-white" :style="{ 'font-size': '10px' }">
                        <ExplainSlider :title="arg.caption" sliderType="factor" :range="arg.range" :step="arg.delta" unit="x" @value-updated="(v) => onFactorUpdated(arg, v)"></ExplainSlider>
                      </div>
                    </div>
                  </div>  
                </div>
              </div>

              <div v-if="field.type == 'factor'">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                  <div class="text-white" :style="{ 'font-size': '10px' }">
                    <ExplainSlider :title="field.caption" sliderType="factor" :range="field.range" :step="field.delta" unit="x" @value-updated="(arg) => onFactorUpdated(field, arg)"></ExplainSlider>
                  </div>
                </div>
              </div>
            </div>

            <q-separator class="q-mt-md"></q-separator>
          </div>


          <div v-if="selectedModelName && state_changed" class="row q-ma-sm">
            <q-btn
              class="col q-ml-xl q-mr-xl"
              color="negative"
              size="sm"
              dense
              @click="updateValue"
              style="font-size: 8px"
              ><q-tooltip>apply property changes (CTRL-E)</q-tooltip> APPLY CHANGES</q-btn
            >
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
          </div>

        </div>
      </q-card>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";
import ExplainSlider from "./ExplainSlider.vue";


export default {
  setup() {
    let selectedModelProps = [];
    let selectedNewModelProps = [];

    return {
      selectedModelProps,
      selectedNewModelProps,
    };
  },
  components: {
      ExplainSlider
  },
  data() {
    return {
      title: "MODEL PROPERTIES EDITOR",
      collapsed: false,
      isEnabled: true,
      editorMode: "abs",
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
      modelTypes: [
        "BloodCapacitance",
        "BloodTimeVaryingElastance",
        "BloodResistor",
        "BloodValve",
        "BloodDiffusor",
        "BloodPump",
        "GasCapacitance",
      ],
      selectedModelName: "",
      selectedModelDescription: "",
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
      collaps_icon: "fa-solid fa-chevron-up",
      fileContent: "",
    };
  },
  methods: {
    onFactorUpdated(field, arg) {
      console.log(field, arg)
    },
    handleFileAdded(files) {
      // Access the first file in the selected files
      const file = files[0];
      if (file) {
        this.readFile(file);
      }
    },
    readFile(file) {
      const reader = new FileReader();

      // Define what happens when the file is successfully read
      reader.onload = (e) => {
        this.fileContent = e.target.result; // Stores the content of the file
        console.log(this.fileContent);
      };

      // Start reading the file as text or data URL based on your needs
      reader.readAsText(file); // Reads as text for JSON or .txt files
    },
    cancelAddModel() {
      this.selectedModelType = "";
      this.resetNewModel();
    },
    addNewModelToEngine() {
      this.newModelErrorFlag = false;
      this.selectedNewModelProps.forEach((prop) => {
        if (prop.target == "name" && prop.value == "") {
          this.newModelErrorFlag = true;
          this.newModelErrorClass = this.newModelError;
          this.newModelErrorMessage = "name is missing";
        }
        if (prop.target == "name" && this.modelNames.includes(prop.value)) {
          this.newModelErrorFlag = true;
          this.newModelErrorClass = this.newModelError;
          this.newModelErrorMessage = "this is name is already in use";
        }
      });

      if (this.newModelErrorFlag) return;

      // convert the properties to a dictionary which the model engine can understand
      let new_model = {
        model_type: this.selectedModelType,
      };
      // add the properties
      this.selectedNewModelProps.forEach((prop) => {
        if (prop.type !== "function") {
          new_model[prop.target] = prop.value;
          if (prop.type == "number") {
            new_model[prop.target] = parseFloat(prop.value / prop.factor);
          }
        }
      });
      // set to the model for processing
      explain.addNewModelToEngine(this.selectedModelType, new_model);

      // send the model to the diagram editor for rendering
      if (this.showNewModelInDiagram) {
        this.$bus.emit("addNewModelToDiagram", new_model);
      }

      this.resetNewModel();
      this.selectedModelType = "";
    },
    resetNewModel() {
      this.selectedNewModelProps = [];
      this.newModelErrorClass = this.noNewModelError;
      this.newModelErrorFlag = false;
      this.redraw += 1;
    },
    addNewModel() {
      // reset the new model properties
      this.resetNewModel();

      // get the model interface of the selected model
      explain.getModelInterface(this.selectedModelType);
    },
    collapsEditor() {
      if (this.isEnabled) {
        this.isEnabled = false;
        this.collaps_icon = "fa-solid fa-chevron-up";
      } else {
        this.isEnabled = true;
        this.collaps_icon = "fa-solid fa-chevron-down";
      }
    },
    changeNewPropState(param, arg) {
      this.state_changed = true;
      param.state_changed = true;
      this.redraw += 1;
    },
    increaseValue(param, arg) {
      this.state_changed = true;
      param.value += param.delta;
      this.redraw += 1;
    },
    decreaseValue(param, arg) {
      this.state_changed = true;
      param.value -= param.delta;
      this.redraw += 1;
    },
    changePropState(param, arg) {
      this.state_changed = true;
      param.state_changed = true;
      this.redraw += 1;
    },
    updateValue() {
      this.selectedModelProps.forEach((prop) => {
        if (prop.state_changed) {
          if (prop.type == "function") {
            let function_name = this.selectedModelName + "." + prop.target;
            let function_args = [];
            prop.args.forEach((arg) => {
              if (arg.type == "number") {
                function_args.push(arg.value / arg.factor);
              } else {
                function_args.push(arg.value);
              }
            });
            explain.callModelFunction(function_name, function_args);
          }

          if (prop.type == "number") {
            let p = this.selectedModelName + "." + prop.target;
            explain.setPropValue(
              p,
              parseFloat(prop.value / prop.factor),
              parseFloat(this.changeInTime),
              0
            );
          }
          if (prop.type == "boolean") {
            let p = this.selectedModelName + "." + prop.target;
            explain.setPropValue(p, prop.value, 0, 0);
          }
          if (prop.type == "string") {
            let new_value = prop.value;
            let p = this.selectedModelName + "." + prop.target;
            explain.setPropValue(p, new_value, 0, 0);
          }
          if (prop.type == "list") {
            let new_value = prop.value;
            let p = this.selectedModelName + "." + prop.target;
            explain.setPropValue(p, new_value, 0, 0);
          }
          if (prop.type == "multiple-list") {
            let new_value = prop.value;
            let p = this.selectedModelName + "." + prop.target;
            explain.setPropValue(p, new_value, 0, 0);
          }
        }
        prop.state_changed = false;
      });

      this.state_changed = false;
    },

    cancel() {
      this.selectedModelName = "";
      this.selectedModelProps = {};
      this.state_changed = false;
      explain.getModelState();
    },
    modelChanged() {
      // enable the full control
      this.isEnabled = true;
      this.collaps_icon = "fa-solid fa-chevron-down";
      this.state_changed = false;
      this.selectModel();
      explain.getModelState();
    },
    selectModel() {
      // copy, don't reference the interfacing items
      this.selectedModelProps = [
        ...Object.values(
          explain.modelState.models[this.selectedModelName].model_interface
        ),
      ];
      this.selectedModelDescription =
        explain.modelState.models[this.selectedModelName].description;

      // add a flag to the property which can be set when the property needs to be updated
      this.selectedModelProps.forEach((param) => {
        param["state_changed"] = false;

        // get the current value
        let f = param.target.split(".");
        if (f.length == 1) {
          param["value"] =
            explain.modelState.models[this.selectedModelName][f[0]];
        }

        if (f.length == 2) {
          param["value"] =
            explain.modelState.models[this.selectedModelName][f[0]][f[1]];
        }

        if (f.length == 3) {
          param["value"] =
            explain.modelState.models[this.selectedModelName][f[0]][f[1]][f[2]];
        }

        // set the other properties
        if (!param.rounding) {
          param["rounding"] = 0.0;
        }
        if (!param.factor) {
          param["factor"] = 1.0;
        }
        if (!param.delta) {
          param["delta"] = 1.0;
        }
        if (!param.range) {
          param["range"] = [-10000000,10000000];
        }
        if (!param.unit) {
          param["unit"] = ""
        }

        // set the numeric value
        if (param.type == "number") {
          param["value"] = (param["value"] * param.factor).toFixed(
            param.rounding
          );
        }

        // if there's a default value then set it
        if (param.default) {
          param["value"] = param.default;
        }

        if (param.options) {
          if (param.type == "list") {
            // build the options list
            param["choices"] = [];
            if (param.custom_options) {
              param["choices"] = param["options"]
            } else {
              Object.values(explain.modelState.models).forEach((model) => {
                if (param.options.includes(model.model_type)) {
                  param["choices"].push(model.name);
                }
              });
            }
          }

          if (param.type == "multiple-list") {
            // build the options list
            param["choices"] = [];
            Object.values(explain.modelState.models).forEach((model) => {
              if (param.options.includes(model.model_type)) {
                param["choices"].push(model.name);
              }
            });
          }
        }

        if (param.type == "function") {
          param.args.forEach((arg) => {
            if (!arg["hidden"]) {
              arg["hidden"] = false;
            }
            // get the current value
            let f = arg.target.split(".");
            if (f.length == 1) {
              arg["value"] =
                explain.modelState.models[this.selectedModelName][f[0]];
            }
            if (f.length == 2) {
              arg["value"] =
                explain.modelState.models[this.selectedModelName][f[0]][f[1]];
            }
            if (f.length == 3) {
              arg["value"] =
                explain.modelState.models[this.selectedModelName][f[0]][f[1]][
                  f[2]
                ];
            }

            if (arg.target) {
              if (arg.type == "number") {
                arg["value"] = (arg["value"] * arg.factor).toFixed(
                  arg.rounding
                );
              }
              if (isNaN(arg["value"])) {
                arg["value"] = arg.default;
              }
              if (arg.options) {
                if (arg.type == "list") {
                  arg["choices"] = [];
                  arg["value"] =
                    explain.modelState.models[this.selectedModelName][
                      arg.target
                    ];
                    if (arg.custom_options) {
                      arg["choices"] = arg["options"]
                    } else {
                      Object.values(explain.modelState.models).forEach((model) => {
                        if (arg.options.includes(model.model_type)) {
                          arg["choices"].push(model.name);
                        }
                      });
                    }
                }
                if (arg.type == "multiple-list") {
                  arg["choices"] = [];
                  arg["value"] =
                    explain.modelState.models[this.selectedModelName][
                      arg.target
                    ];
                    if (arg.custom_options) {
                      arg["choices"] = arg["options"]
                    } else {
                      Object.values(explain.modelState.models).forEach((model) => {
                        if (arg.options.includes(model.model_type)) {
                          arg["choices"].push(model.name);
                        }
                      });
                    }
                }
              }
            }
          });
        }
      });
      this.redraw += 1;
    },
    processAvailableModels() {
      this.modelNames = [];
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          this.selectModel();
        }
      } catch {}
    },
    processAvailableModelTypes(data) {
      this.availableModelTypes = data;
    },
  },
  beforeUnmount() {
    this.state_changed = false;
    document.removeEventListener("model_types", (data) => {
      this.processAvailableModelTypes(data.model_types);
    });
    this.$bus.off("change_props", this.updateValue )
  },
  mounted() {
    try {
      document.removeEventListener("model_types", (data) => {
        this.processAvailableModelTypes(data.model_types);
      });
    } catch {}
    document.addEventListener("model_types", (data) => {
      this.processAvailableModelTypes(data.model_types);
    });

    // get all available model types
    explain.getModelTypes();

    // update if state changes
    this.$bus.on("state", this.processAvailableModels);

    // check whether a change props event is fires
    this.$bus.on("change_props", this.updateValue )
  },
};
</script>

<style></style>
