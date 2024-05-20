import { defineStore } from "pinia";

export const useConditionStore = defineStore("condition", {
  condition: () => ({
    user: "",
    name: "",
    protected: false,
    shared: false,
    dateCreated: "",
    dateLastUpdated: "",
    diagram_definition: {},
    model_definition: {},
    configuration: {},
  }),

  getters: {},

  actions: {
    getAllConditionsFromServer(apiUrl, userName, token) {},
    getConditionFromServer(apiUrl, userName, patientName, token) {},
    saveConditionToServer(apiUrl, userName, token) {},
  },
});
