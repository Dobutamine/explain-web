import { defineStore } from "pinia";

export const usePatientStore = defineStore("patient", {
  state: () => ({
    owner: "",
    name: "",
    protected: false,
    shared: false,
    dateCreated: "",
    dateLastUpdated: "",
    diagram_definition: {},
    model_definition: {},
  }),

  getters: {},

  actions: {
    getAllPatientsFromServer(apiUrl, userName, token) {},
    getPatientFromServer(apiUrl, userName, patientName, token) {},
    savePatientToServer(apiUrl, userName, token) {},
  },
});
