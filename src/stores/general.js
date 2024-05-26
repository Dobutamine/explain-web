import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state: () => ({
    // apiUrl: "http://127.0.0.1:8081",
    apiUrl: "https://explain-user.com",
  }),

  getters: {},

  actions: {},
});
