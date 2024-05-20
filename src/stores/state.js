import { defineStore } from "pinia";

export const useStateStore = defineStore("state", {
  state: () => ({
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
    getAllStatesFromServer(apiUrl, userName, token) {},
    getStateFromServer(apiUrl, userName, patientName, token) {},
    saveStateToServer(apiUrl, userName, token) {},
  },
});
