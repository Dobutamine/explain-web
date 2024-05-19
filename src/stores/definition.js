import { defineStore } from "pinia";

export const useDefinitionStore = defineStore("definition", {
  state: () => ({
    name: "",
    definition: "",
  }),

  getters: {},

  actions: {
    async saveDefinitionToServer(apiUrl, userName, token) {
      const url = `${apiUrl}/api/definitions/update_definition?token=${token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName,
          name: this.name,
          definition: this.definition,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        return data.message;
      } else {
        return false;
      }
    },
    async loadDefinitionFromServer(apiUrl, userName, definitionName, token) {
      const url = `${apiUrl}/api/definitions/get_definition?token=${token}`;
      // get the user login data
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName,
          name: definitionName,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.name = data.name;
        this.definition = data.definition;
        console.log("Definition loaded.");
        return true;
      } else {
        // we can't find a definition for this user so we have to supply the default one
        console.log("Failed to load the definition.");
        // let result = await this.getDefaultDefinition(apiUrl, userName, token);
        return result;
      }
    },
  },
});
