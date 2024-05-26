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
    saved: false,
    default: true,
    prev_diagram_definition: {},
  }),

  getters: {},

  actions: {
    renameState(newName, userName) {
      if (newName !== this.name) {
        this.name = newName;
        this.default = false;
        this.protected = false;
        this.user = userName.toLowerCase();
        this.dateCreated = new Date();
        this.dateCreated = this.dateCreated.toISOString();
        this.saved = false;
      }
    },
    async getAllSharedStatesFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/states/get_all_shared_states?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        return data;
      } else {
        return false;
      }
    },
    async getAllUserStatesFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/states/get_all_user_states?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        return data;
      } else {
        return false;
      }
    },
    async getDefaultStateFromServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/states/get_user_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: "timothy",
          name: "baseline neonate",
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.user = userName.toLowerCase();
        this.name = "baseline neonate";
        this.protected = true;
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
    async getStateFromServer(apiUrl, userName, stateName, token) {
      const url = `${apiUrl}/api/states/get_user_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName.toLowerCase(),
          name: stateName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.user = data.user.toLowerCase();
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
    async getSharedStateFromServer(apiUrl, stateName, token) {
      const url = `${apiUrl}/api/states/get_shared_state?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: stateName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.user = data.user.toLowerCase();
        this.name = data.name;
        this.protected = true;
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
            user: userName.toLowerCase(),
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
          return { result: true, message: "State saved" };
        } else {
          return {
            result: false,
            message:
              "State could not saved! Server error. Contact administrator.",
          };
        }
      } else {
        return {
          result: false,
          message:
            "State is protected. Please store state under a different name.",
        };
      }
    },
  },
});
