<template>
    <div class="q-mt-xs justify-center items-center">
        <q-badge class="bg-transparent text-white" style="font-size: 12px;">
              {{ title }} : {{ value.toFixed(2) }} {{ unit }}
        </q-badge>
        <div class="row justify-center"> 
          <q-btn
            @click="decreaseValue"
            class="q-ma-sm col"
            color="grey-10"
            dense
            size="xs"
            icon="fa-solid fa-chevron-left"
          ></q-btn>
          <q-slider
            class="q-ma-sm q-mr-sm col-8"
            v-model="sliderValue"
            :min="range[0]"
            :max="range[1]"
            :step="step"
            dense
            thumb-color="teal"
            color="transparent"
            selection-color="transparent"
            @update:model-value="sliderChanged"
          />
          <q-btn
            @click="increaseValue"
            class="q-ma-sm col"
            dense
            size="xs"
            color="grey-10"
            icon="fa-solid fa-chevron-right"
          ></q-btn>
        </div>
    </div>
  </template>
  <script>
  export default {
    props: {
      title: {
        type: String,
        default: '',
      },
      initialValue: {
        type: Number,
        default: 1.0
      },
      range: {
        type: Array,
        default: [-2, 2],
      },
      unit: {
        type: String,
        default: "x"
      },
      step: {
        type: Number,
        default: 0.01,
      },
      sliderType: {
          type: String,
          default: "factor"
      }
    },
    name: "MainPage",
    setup() {},
    data() {
      return {
        isEnabled: true,
        sliderValue: 0,
        value: 1
      };
    },
    methods: {
      increaseValue(){
        this.sliderValue += this.step
        this.sliderChanged()
      },
      decreaseValue(){
        this.sliderValue -= this.step
        this.sliderChanged()
      },
      sliderChanged() {
        switch (this.sliderType) {
          case "factor":
            this.changeFactor()
            break;
          case "absolute":
            this.changeValue()
            break;
        }

      },
      changeFactor() {
        this.value = Math.pow(10, this.sliderValue)
        if (this.value < Math.pow(10, this.range[0])) {
            this.value = Math.pow(10, this.range[0])
        }
        if (this.value > Math.pow(10, this.range[1])) {
            this.value = Math.pow(10, this.range[1])
        }
        this.sliderValue = Math.log10(this.value)
        this.$emit('value-updated', this.value)
      },
      changeValue() {
        this.value = this.sliderValue
        if (this.value < this.range[0]) {
          this.value = this.range[0]
        }
        if (this.value > this.range[1]) {
          this.value = this.range[1]
        }
        this.$emit('value-updated', this.value)
      }
    },
    beforeUnmount() {},
    mounted() {
      this.value = parseFloat(this.initialValue)
    },
  }
  </script>
