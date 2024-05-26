import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: "",
    name: "",
    email: "",
    institution: "",
    admin: false,
    subscription: {
      subscriptionType: "",
      subscriptionStartDate: "",
      subscriptionEndDate: "",
      subscriptionAutoRenew: false,
    },
    additionalData: {},
    loggedIn: false,
    defaultState: "baseline neonate",
    errorText: "",
    token: "",
  }),

  getters: {},

  actions: {
    logOut() {
      this.id = "";
      this.name = "";
      this.password = "";
      this.email = "";
      this.institution = "";
      this.subscription = {
        subscriptionType: "",
        subscriptionStartDate: "",
        subscriptionEndDate: "",
        subscriptionAutoRenew: false,
      };
      this.additionalData = {};
      this.token = "";
      this.admin = false;
      this.defaultState = "normal_neonate_24h";
      this.loggedIn = false;
      this.errorText = "";
    },
    async logIn(apiUrl, name, password) {
      const url = `${apiUrl}/api/auth`;
      // get the user log in data
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.toLowerCase(), password: password }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.id = data._id;
        this.name = data.name.toLowerCase();
        this.email = data.email;
        this.institution = data.institution;
        this.subscription = data.subscription;
        this.additionalData = data.additionalData;
        this.admin = data.admin;
        this.token = data.token;
        this.defaultState = data.defaultState;
        this.loggedIn = true;
        this.errorText = "";
        return true;
      } else {
        this.errorText = "Invalid username or password";
        // reset the password entry
        this.password = "";
        this.loggedIn = false;
        return false;
      }
    },
    async registerNewUser(
      apiUrl,
      name,
      email,
      password,
      admin = false,
      institution = "",
      subscriptionType = "",
      additionalData = {}
    ) {
      const url = `${apiUrl}/api/users/new_user`;
      // make the start date
      let startDate = new Date();
      startDate = startDate.toISOString();
      let endDate = "";
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.toLowerCase(),
          email: email,
          password: password,
          admin: admin,
          institution: institution,
          subscription: {
            subscriptionType: subscriptionType,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            subscriptionAutoRenew: false,
          },
          additionalData: additionalData,
          defaultState: "normal_neonate_24h",
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.id = data._id;
        this.name = data.name.toLowerCase();
        this.email = data.email;
        this.token = data.token;
        this.admin = data.admin;
        this.defaultState = data.defaultState;
        this.institution = data.institution;
        this.subscription = data.subscription;
        this.additionalData = data.additionalData;
        this.loggedIn = true;
        this.errorText = "";
        return true;
      } else {
        this.errorText = "Invalid username or password";
        // reset the password entry
        this.password = "";
        this.name = "";
        this.email = "";
        this.token = "";
        this.admin = false;
        this.loggedIn = false;
        this.defaultState = "normal_neonate_24h";
        return false;
      }
    },
    async updateUser(apiUrl, token) {
      const url = `${apiUrl}/api/users/me?token=${token}`;
      // get the user login data
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.name.toLowerCase(),
          email: this.email,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();

        return data.message;
      } else {
        return false;
      }
    },
  },
});
