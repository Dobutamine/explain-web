import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    counter: 0,
    diagram_speed: 1,
    diagram_scale: 1,
    chart_hires: false,
  }),

  getters: {},

  actions: {},
});
