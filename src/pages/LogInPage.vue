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
          style="width: 150px" size="sm">CANCEL</q-btn>
      </div>
      <div class="col text-center"></div>
    </div>
    <div v-if="login" class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <br />
        <p>
          This Explain model is a webapplication developed by
          Tim Antonius, Willem van Meurs, Berend Westerhof and Willem de Boode <br> <br> By clicking the Donate Me
          button and contributing, you're directly supporting this
          website. Every donation, big or small, is immensely appreciated. <br><br>Thank you!
        </p>
        <div class="row justify-center items-start q-ma-lg">
          <form action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value="8S8Y4MJYQUTYE" />
            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0"
              name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
            <img alt="" border="0" src="https://www.paypal.com/en_NL/i/scr/pixel.gif" width="1" height="1" />
          </form>
        </div>
        <!-- <h6 style="color: red;">IMPORTANT MESSAGE FOR USERS COMING FROM MONITOREMULATOR.COM</h6>
        <h6>Please reregister your name, email and password</h6>
        <h6>From now one use https://explain-monitor.com instead of https://monitoremulator.com to keep using the monitor emulator.</h6>
 -->

        <br />
        <a href="mailto: tajantonius@gmail.com">Report comments or bugs here!</a>
      </div>
      <div class="col text-center">

      </div>
    </div>

    <div class="row justify-center items-start q-ma-lg">
      <div class="col text-center"></div>
      <div class="col text-center">
        <q-card v-if="user.errorText != ''" class="q-pa-sm">
          {{ user.errorText }}
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
import { useConfigStore } from "../stores/config";

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
      name: "",
      email: "",
      password: "",
      id: "",
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
    registerNewUser() {
      this.user.registerNewUser(
        this.general.apiUrl,
        this.name,
        this.email,
        this.password
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
