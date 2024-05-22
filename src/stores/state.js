import { defineStore } from "pinia";

export const useStateStore = defineStore("state", {
  state: () => ({
    user: "",
    name: "",
    protected: false,
    shared: false,
    dateCreated: "r",
    dateLastUpdated: "r",
    diagram_definition: {
      settings: {},
      components: {},
    },
    model_definition: {},
    configuration: {},
  }),

  getters: {},

  actions: {
    getAllStatesFromServer(apiUrl, userName, token) {},
    async getStateFromServer(apiUrl, userName, stateName, token) {
      const url = `${apiUrl}/api/states/get_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName,
          name: stateName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.user = data.user;
        this.name = data.name;
        this.protected = data.protected;
        this.shared = data.shared;
        this.dateCreated = data.dateCreated;
        this.dateLastUpdated = data.dateLastUpdated;
        this.diagram_definition = data.diagram_definition;
        this.model_definition = data.model_definition;
        this.configuration = data.configuration;
        return true;
      } else {
        return false;
      }
    },
    async saveStateToServer(apiUrl, userName, token) {
      if (!this.protected) {
        this.name = this.model_definition.name;
        this.dateCreated = this.model_definition.date_created;
        this.dateLastUpdated = new Date();
        this.dateLastUpdated = this.dateLastUpdated.toISOString();

        const url = `${apiUrl}/api/states/update_state?token=${token}`;
        let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userName,
            name: this.name,
            protected: this.protected,
            shared: this.shared,
            dateCreated: this.dateCreated,
            dateLastUpdated: this.dateLastUpdated,
            diagram_definition: this.diagram_definition,
            model_definition: this.model_definition,
            configuration: this.configuration,
          }),
        });

        if (response.status === 200) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
  },
});
