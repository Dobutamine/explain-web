<template>
  <q-page padding class="bg-black">
    <div v-if="login" class="row justify-center items-start" style="font-size: 58px;">
      EXPLAIN
    </div>
    <div v-if="login" class="row justify-center" style="font-size: 18px;">
      EXPLANATORY MODELS IN NEONATOLOGY
    </div>
    <div v-if="login" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-input v-model="name" :value="name" stack-label autofocus label="USER NAME">
        </q-input>
      </div>
      <div class="col text-center"></div>
    </div>

    <div v-if="newUserEntry" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-input v-model="email" type="email" :value="email" stack-label autofocus label="EMAIL">
        </q-input>
      </div>
      <div class="col text-center"></div>
    </div>

    <div v-if="newUserEntry" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-input v-model="institution" :value="institution" stack-label autofocus label="INSTITUTION">
        </q-input>
      </div>
      <div class="col text-center"></div>
    </div>

    <div v-if="newUserEntry" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-select v-model="subscriptionType" :options="subscriptionTypes" readonly stack-label autofocus
          label="SUBSCRIPTION PLAN">
        </q-select>
      </div>
      <div class="col text-center"></div>
    </div>

    <div v-if="login" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-form @submit="pressedEnter">
          <q-input v-model="password" type="password" :value="id" stack-label label="PASSWORD">
          </q-input>
        </q-form>
      </div>
      <div class="col text-center"></div>
    </div>

    <div v-if="login" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col2 text-center">
        <q-btn v-if="!newUserEntry" class="q-pl-lg q-pr-lg bg-blue-grey-10" @click="LogIn"
          style="width: 150px;font-size: 16px;" size="sm">LOG IN</q-btn>
        <q-btn class="q-ml-lg q-pl-lg q-pr-lg bg-blue-grey-10" @click="showRegistration"
          style="width: 150px;font-size: 16px;" size="sm">REGISTER</q-btn>
        <q-btn v-if="newUserEntry" class="q-ml-lg q-pl-lg q-pr-lg bg-blue-grey-10" @click="cancelRegistration"
          style="width: 150px;font-size: 16px;" size="sm">CANCEL</q-btn>
      </div>
      <div class="col text-center"></div>
    </div>
    <div v-if="login" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <br />
        <p>
          This Explain webapplication is developed by Tim Antonius, Willem van Meurs, Berend Westerhof and Willem de
          Boode <br>
        </p>

        <br />
        <a href="mailto: tajantonius@gmail.com">Report comments or bugs here!</a>
      </div>
      <div class="col text-center">

      </div>
    </div>

    <div class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-card v-if="errorText != ''" class="q-pa-sm">
          {{ errorText }}
        </q-card>
      </div>
      <div class="col text-center"></div>
    </div>
    <div class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center"></div>
    </div>
  </q-page>
</template>

<script>
import { useUserStore } from "src/stores/user";
import { useGeneralStore } from "../stores/general";

//import axios from "axios";
/* eslint-disable */
export default {
  setup() {
    const user = useUserStore();
    const general = useGeneralStore();

    return {
      user,
      general,
    };
  },
  data() {
    return {
      id: "",
      name: "",
      email: "",
      institution: "",
      admin: false,
      password: "",
      subscriptionTypes: ["free", "premium", "institution"],
      subscriptionType: "free",
      subscriptionStartDate: "",
      subscriptionEndDate: "",
      subscriptionAutoRenew: false,
      additionalData: {},
      errorText: "",
      connected: false,
      showChoices: false,
      newUserEntry: false,
      login: true,
      get_config: null,
      log_in: null,
      get_definition: null,
    };
  },
  methods: {
    validateRegisterRequest() {
      if (this.name === "") {
        this.errorText = "Please enter a username!";
        return false;
      }
      if (this.email === "") {
        this.errorText = "Please enter an email address!";
        return false;
      }
      if (this.institution === "") {
        this.errorText = "Please enter an institution!";
        return false;
      }
      if (this.password === "") {
        this.errorText = "Please enter a password!";
        return false;
      }

      return true;
    },
    registerNewUser() {
      if (!this.validateRegisterRequest()) {
        return;
      }
      this.user.registerNewUser(
        this.general.apiUrl,
        this.name,
        this.email,
        this.password,
        this.admin,
        this.institution,
        this.subscriptionType,
        this.additionalData
      );
      this.newUserEntry = false;
    },
    showRegistration() {
      if (!this.newUserEntry) {
        this.newUserEntry = true;
      } else {
        this.registerNewUser();
      }
    },
    cancelRegistration() {
      this.id = "";
      this.newUserEntry = false;
      this.login = true;
      this.email = "";
      this.password = "";
      this.name = "";
      this.institution = "";
      this.subscriptionType = "free";
      this.subscriptionStartDate = "";
      this.subscriptionEndDate = "";
      this.subscriptionAutoRenew = false;
      this.additionalData = {};
    },
    LogIn() {
      this.user.logIn(this.general.apiUrl, this.name, this.password);
    },
    LogOut() {
      this.id = "";
      this.showChoices = false;
      this.login = true;
      this.email = "";
      this.password = "";
      this.name = "";
      this.institution = "";
      this.subscriptionType = "free";
      this.subscriptionStartDate = "";
      this.subscriptionEndDate = "";
      this.subscriptionAutoRenew = false;
      this.additionalData = {};
      this.errorText = "";
    },
    pressedEnter() {
      if (this.newUserEntry) {
        this.registerNewUser();
      } else {
        this.LogIn();
      }
    },
  },

  beforeUnmount() {
    this.log_in();
  },
  mounted() {
    this.$q.dark.set(true);
    // define a login request handler
    this.log_in = this.user.$onAction(({ name, after }) => {
      if (name === "logIn") {
        after((result) => {
          if (result) {
            this.errorText = "";
            // transfer to main page
            this.$router.push("/explain");
          } else {
            this.errorText = "Invalid username or password!";
          }
        });
      }
    });

    this.$bus.on("registered", () => {
      this.newUserEntry = false;
    });

    if (process.env.DEV) {
      //override login for developement development
      this.password = "y5qkqjed";
      this.name = "timothy";
      this.user.logIn(this.general.apiUrl, this.name, this.password);
    }
  },
};
</script>

<style>
a:link {
  color: grey;
  background-color: transparent;
  text-decoration: none;
}

a:visited {
  color: grey;
  background-color: transparent;
  text-decoration: none;
}

a:hover {
  color: red;
  background-color: transparent;
  text-decoration: underline;
}

a:active {
  color: yellow;
  background-color: transparent;
  text-decoration: underline;
}
</style>
