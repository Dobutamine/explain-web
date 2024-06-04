<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="controllers.enabled = !controllers.enabled">
      {{ controllers.title }}
    </div>

    <div v-if="controllers.enabled" class="q-mb-sm">
      <div v-for="(category, category_name) in controllers.categories" :key="category_name">
        <div class="q-ml-md q-md-sm q-mt-xs row gutter justify-center text-secondary">
          <div class="q-mt-sm text-secondary" @click="selectEnabled(category)" style="font-size: small;">
            {{ category.caption }}
          </div>
          <q-btn v-if="category.enabled" @click="selectAdvanced(category)" class="q-ma-sm"
            :color="category.advancedColor" dense size="xs" icon="fa-solid fa-ellipsis"></q-btn>
        </div>
        <div v-if="!category.advanced">
          <div v-for="(controller, controller_name) in controllers.items" :key="controller_name">
            <div v-if="controller.type == 'factor' || controller.type == 'number'">
              <div v-if="controller.category == category_name && !controller.advanced">
                <div v-if="category.enabled && !(controller.linked && controller.linked_to == '')">
                  <div class="row justify-center">
                    <q-badge class="q-pa-sm" color="grey-10">
                      <div v-if="!controller.linked" style="font-size: small;">
                        <div v-if="controller.type == 'factor'">
                          {{ controller.caption }} = {{ controller.display_value }} x N
                        </div>
                        <div v-else>
                          {{ controller.caption }} = {{ controller.display_value }} {{ controller.unit }}
                        </div>
                      </div>
                      <div v-if="controller.linked" style="font-size: small;">
                        <div v-if="controller.type == 'factor'">
                          {{ controller.linked_caption }} = {{ controller.display_value }} x N
                        </div>
                        <div v-else>
                          {{ controller.linked_caption }} = {{ controller.display_value }} {{ controller.unit }}
                        </div>
                      </div>
                      <q-btn v-if="controller.link_button" @click="linkControllers(controller)" class="q-ml-sm" dense
                        size="xs" icon="fa-solid fa-link" :color="controller.link_color"></q-btn>
                    </q-badge>
                  </div>
                  <div class="row  justify-center">
                    <q-btn @click="decreaseValue(controller)" class="q-ma-sm col" color="grey-10" dense size="xs"
                      icon="fa-solid fa-chevron-left"></q-btn>
                    <q-slider class="q-ma-sm q-mr-sm col-8" v-model="controller.slider_value" :step="controller.step"
                      :min="controller.min" :max="controller.max" snap :markers="10" dense thumb-color="teal"
                      color="transparent" @change="changeValue(controller)" />
                    <q-btn @click="increaseValue(controller)" class="q-ma-sm col" dense size="xs" color="grey-10"
                      icon="fa-solid fa-chevron-right"></q-btn>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="controller.type == 'boolean'">
              <div v-if="controller.category == category_name && !controller.advanced">
                <div v-if="category.enabled">
                  <div class="row justify-center">
                    <q-badge class="q-pa-sm" color="grey-10">
                      <div style="font-size: small;">
                        {{ controller.caption }}
                        <q-toggle class="q-ml-sm" v-model="controller.model_value" dense size="sm"
                          @update:model-value="changeValue(controller)"></q-toggle>
                      </div>
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="controller.type == 'string'">
              <div v-if="controller.category == category_name && !controller.advanced">
                <div v-if="category.enabled">
                  <div class="q-mr-lg q-ml-lg q-mt-sm justify-center">
                    <q-input class="q-ml-sm" :label="controller.caption" v-model="controller.model_value" dense
                      debounce="1000" @update:model-value="changeValue(controller)"></q-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="category.advanced">
          <div v-for="(controller, controller_name) in controllers.items" :key="controller_name">
            <div v-if="controller.type == 'factor' || controller.type == 'number'">
              <div v-if="controller.category == category_name">
                <div v-if="category.enabled && !(controller.linked && controller.linked_to == '')">
                  <div class="row justify-center">
                    <q-badge class="q-pa-sm" color="grey-10">
                      <div v-if="!controller.linked" style="font-size: small;">
                        <div v-if="controller.type == 'factor'">
                          {{ controller.caption }} = {{ controller.display_value }} x N
                        </div>
                        <div v-else>
                          {{ controller.caption }} = {{ controller.display_value }} {{ controller.unit }}
                        </div>
                      </div>
                      <div v-if="controller.linked" style="font-size: small;">
                        <div v-if="controller.type == 'factor'">
                          {{ controller.linked_caption }} = {{ controller.display_value }} x N
                        </div>
                        <div v-else>
                          {{ controller.linked_caption }} = {{ controller.display_value }} {{ controller.unit }}
                        </div>
                      </div>
                      <q-btn v-if="controller.link_button" @click="linkControllers(controller)" class="q-ml-sm" dense
                        size="xs" icon="fa-solid fa-link" :color="controller.link_color"></q-btn>
                    </q-badge>
                  </div>
                  <div class="row justify-center">
                    <q-btn @click="decreaseValue(controller)" class="q-ma-sm col" color="grey-10" dense size="xs"
                      icon="fa-solid fa-chevron-left"></q-btn>
                    <q-slider class="q-ma-sm q-mr-sm col-8" v-model="controller.slider_value" :step="controller.step"
                      :min="controller.min" :max="controller.max" snap :markers="10" dense thumb-color="teal"
                      color="transparent" @change="changeValue(controller)" />
                    <q-btn @click="increaseValue(controller)" class="q-ma-sm col" dense size="xs" color="grey-10"
                      icon="fa-solid fa-chevron-right"></q-btn>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="controller.type == 'boolean'">
              <div v-if="controller.category == category_name">
                <div v-if="category.enabled">
                  <div class="row justify-center">
                    <q-badge class="q-pa-sm" color="grey-10">
                      <div style="font-size: small;">
                        {{ controller.caption }}
                        <q-toggle class="q-ml-sm" v-model="controller.model_value" dense size="sm"
                          @update:model-value="changeValue(controller)"></q-toggle>
                      </div>
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="controller.type == 'string'">
              <div v-if="controller.category == category_name">
                <div v-if="category.enabled">
                  <div class="q-mr-lg q-ml-lg q-mt-sm justify-center">
                    <q-input class="q-ml-sm" :label="controller.caption" v-model="controller.model_value" dense
                      debounce="1000" @update:model-value="changeValue(controller)"></q-input>
                  </div>
                </div>
              </div>
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
  props: {
    config: Object,
  },
  data() {
    return {
      title: "CIRCULATORY SYSTEM",
      advanced: false,
      isEnabled: true,
      enabled: true,
      controllers: {
        categories: {
          heart: {
            caption: "Heart",
            enabled: true,
            advanced: false,
            enabledIcon: "fa-solid fa-chevron-down",
            enabledColor: "transparent",
            advancedColor: "transparent",
          },
          circulation: {
            caption: "Circulation",
            enabled: true,
            advanced: false,
            enabledIcon: "fa-solid fa-chevron-down",
            enabledColor: "transparent",
            advancedColor: "transparent",
          },
          shunts: {
            caption: "Shunts",
            enabled: true,
            advanced: false,
            enabledIcon: "fa-solid fa-chevron-down",
            enabledColor: "transparent",
            advancedColor: "transparent",
          }
        },
        items: {
          left_contractility: {
            caption: "left heart contractility",
            category: "heart",
            enabled: true,
            advanced: true,
            linked: true,
            link_button: true,
            link_color: "transparent",
            linked_caption: "heart contractility L/R",
            linked_to: "right_contractility",
            type: "factor",
            model: "LV",
            prop: "el_max_factor",
            model_value: 0.0,
            slider_value: 0.0,
            display_value: 0.0,
            min: -10.0,
            max: 10.0,
            step: 0.05
          },
          right_contractility: {
            caption: "right heart contractility",
            category: "heart",
            enabled: true,
            advanced: false,
            linked: true,
            link_color: "transparent",
            link_button: false,
            linked_to: "",
            type: "factor",
            model: "RV",
            prop: "el_max_factor",
            model_value: 0.0,
            slider_value: 0.0,
            display_value: 0.0,
            min: -10.0,
            max: 10.0,
            step: 0.05
          }
        }
      },
    };
  },
  methods: {
    selectEnabled(category) {
      if (category.enabled) {
        category.enabled = false
      } else {
        category.enabled = true
      }

    },
    linkControllers(controller) {
      if (controller.linked_to) {
        if (controller.linked) {
          controller.linked = false
          controller.link_color = "negative"
          this.controllers.items[controller.linked_to].linked = false
        } else {
          controller.linked = true
          controller.link_color = "transparent"
          this.controllers.items[controller.linked_to].linked = true
        }
      }

    },
    selectAdvanced(category) {
      if (category.advanced) {
        category.advanced = false
        category.advancedColor = "transparent"
      } else {
        category.advanced = true
        category.advancedColor = "negative"
      }
    },
    changeValue(controller) {
      switch (controller.type) {
        case "factor":
          controller.model_value = this.translateSliderToValue(controller.slider_value)
          controller.display_value = controller.model_value.toFixed(controller.rounding)
          let target_factor = controller.model + "." + controller.prop
          if (controller.caller == 'direct') {
            explain.setPropValue(target_factor, controller.model_value, 0.0)
          }
          if (controller.caller == 'function') {
            let target_function = controller.model + "." + controller.function_name
            explain.callModelFunction(target_function, [controller.model_value])
          }


          if (controller.linked) {
            this.controllers.items[controller.linked_to].model_value = controller.model_value
            this.controllers.items[controller.linked_to].display_value = controller.display_value
            let target_factor_linked = this.controllers.items[controller.linked_to].model + "." + this.controllers.items[controller.linked_to].prop
            if (controller.caller == 'direct') {
              explain.setPropValue(target_factor_linked, this.controllers.items[controller.linked_to].model_value, 0.0)
            }
            if (controller.caller == 'function') {
              let target_factor_function = this.controllers.items[controller.linked_to].model + "." + this.controllers.items[controller.linked_to].function_name
              explain.callModelFunction(target_factor_function, [controller.model_value])
            }

          }
          break;
        case "number":
          controller.model_value = controller.slider_value
          controller.display_value = controller.model_value.toFixed(controller.rounding)
          let target_number = controller.model + "." + controller.prop
          if (controller.caller == 'direct') {
            explain.setPropValue(target_number, controller.model_value, 0.0)
          }
          if (controller.caller == 'function') {
            let target_function = controller.model + "." + controller.function_name
            explain.callModelFunction(target_function, [controller.model_value])
          }
          break;

        case "boolean":
          let target_boolean = controller.model + "." + controller.prop
          if (controller.caller == 'direct') {
            explain.setPropValue(target_boolean, controller.model_value)
          }
          if (controller.caller == 'function') {
            let target_function = controller.model + "." + controller.function_name
            explain.callModelFunction(target_function, [controller.model_value])
          }
          // as is_enabled changes the execution list and watchlist
          this.$bus.emit("update_watchlist")
          break;

        case "string":
          let target_string = controller.model + "." + controller.prop
          if (controller.caller == 'direct') {
            explain.setPropValue(target_string, controller.model_value)
          }
          if (controller.caller == 'function') {
            let target_function = controller.model + "." + controller.function_name
            explain.callModelFunction(target_function, [controller.model_value])
          }
          if (controller.bus_message) {
            this.$bus.emit(controller.bus_message, controller.model_value)
          }
          break;

      }
    },
    increaseValue(controller) {
      controller.slider_value += controller.step
      if (controller.slider_value > controller.max) {
        controller.slider_value = controller.max
      }
      this.changeValue(controller)
    },
    decreaseValue(controller) {
      controller.slider_value -= controller.step
      if (controller.slider_value < controller.min) {
        controller.slider_value = controller.min
      }
      this.changeValue(controller)
    },
    updateModel(controller) {

    },
    translateSliderToValue(v) {
      if (v == 0) {
        return 1;
      }

      if (v < 0) {
        return -(1 / (v - 1));
      }

      if (v < 1) {
        return 1 + v
      }

      return 1 + v
    },
    translateValueToSlider(v) {
      if (v < 1) {
        return (-(1 / v) + 1.0)
      }

      if (v > 1) {
        return (v - 1)
      }

      return 0;
    },
    processModelState() {
      if (explain.modelState.models) {
        if (this.controllers.items) {
          for (let [controller_name, controller] of Object.entries(this.controllers.items)) {
            switch (controller.type) {
              case 'factor':
                controller.model_value = explain.modelState.models[controller.model][controller.prop]
                controller.slider_value = this.translateValueToSlider(controller.model_value)
                if (!isNaN(controller.model_value)) {
                  controller.display_value = controller.model_value.toFixed(controller.rounding)
                }
                break;
              case 'number':
                controller.model_value = explain.modelState.models[controller.model][controller.prop]
                controller.slider_value = controller.model_value
                if (!isNaN(controller.model_value)) {
                  controller.display_value = controller.model_value.toFixed(controller.rounding)
                }
                break;
              case 'string':
                controller.model_value = explain.modelState.models[controller.model][controller.prop]
                controller.slider_value = controller.model_value
                controller.display_value = controller.model_value
                break;
              case 'boolean':
                controller.model_value = explain.modelState.models[controller.model][controller.prop]
                controller.slider_value = controller.model_value
                controller.display_value = controller.model_value
                break;
            }
          }
        }
      }
    },
  },
  beforeUnmount() {

  },
  mounted() {
    this.$bus.on("state", this.processModelState)
    // copy the configuration object
    this.controllers = { ...this.config }
    // build the controllers object
    if (this.controllers.categories) {
      Object.values(this.controllers.categories).forEach(category => {
        category['enabledColor'] = "transparent"
        category['advancedColor'] = "transparent"
      })

    }
    if (this.controllers.items) {
      Object.values(this.controllers.items).forEach(item => {
        item['link_color'] = "transparent"
        item['model_value'] = 0.0
        item['slider_value'] = 0.0
        item['display_value'] = 0.0
        if (!item['rounding']) {
          item['rounding'] = 1.0
        }
      })
    }

  },
};
</script>

<style></style>
