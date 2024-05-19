import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: "",
    name: "",
    password: "",
    email: "",
    token: "",
    admin: false,
    loggedIn: false,
  }),

  getters: {},

  actions: {
    logOut() {
      this.id = "";
      this.name = "";
      this.token = "";
      this.admin = false;
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
        body: JSON.stringify({ name: name, password: password }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.id = data._id;
        this.name = data.name;
        this.email = data.email;
        this.token = data.token;
        this.admin = data.admin;
        this.loggedIn = true;
        this.errorText = "";
        console.log("User logged in.");
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
        return false;
      }
    },
    async registerNewUser(apiUrl, name, email, password) {
      const url = `${apiUrl}/api/users/new_user`;
      // get the user log in data
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, email: email, password: password }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.id = data._id;
        this.name = data.name;
        this.email = data.email;
        this.token = data.token;
        this.admin = data.admin;
        this.loggedIn = true;
        this.errorText = "";
        console.log("User registered.");
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
          name: this.name,
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
