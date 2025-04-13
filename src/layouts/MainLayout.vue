<template>
  <q-layout view="hHh lpR fFf">
    <q-header
      class="bg-indigo-10 text-white headerCustomStyle"
      height-hint="68"
    >
      <q-toolbar>
        <q-toolbar-title class="text-overline">
          Explanatory models in neonatology (EXPLAIN)
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-page-container class="black-background">
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-8 text-white footerCustomStyle">
      <q-toolbar v-if="user.loggedIn">
        <q-toolbar-title class="text-overline">
          <div>{{ statusMessage }}</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useUserStore } from "src/stores/user";
import { useStateStore } from "src/stores/state";
import { explain } from "src/boot/explain";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const user = useUserStore();
    const state = useStateStore();

    return {
      user,
      state,
    };
  },
  data() {
    return {
      statusMessage: "STATUS:"
    };
  },
  methods: {
    updateStatusMessage(message) {
      this.statusMessage = "STATUS: " + message
    },
    modelReady() {
      this.updateStatusMessage("ModelEngine succesfully loaded model definition")
      this.$bus.emit("model_ready")
    },
    errorUpdate() {
      this.updateStatusMessage("ModelEngine failed to load model definition")
      this.$bus.emit("error");
    },



    statusUpdate() {
      this.$bus.emit("status");
      this.statusMessage = explain.status_message;
    },
    stateUpdate() {
      this.$bus.emit("state");
    },
    dataSlowUpdate() {
      this.$bus.emit("rts");
    },
    dataFastUpdate() {
      this.$bus.emit("rtf");
    },
    dataUpdate() {
      this.$bus.emit("data");
    },

  },
  beforeUnmount() {
    document.removeEventListener("model_ready", this.model_ready);
    document.removeEventListener("error", this.errorUpdate);


    document.removeEventListener("state", this.stateUpdate);
    document.removeEventListener("status", this.statusUpdate);

 
    document.removeEventListener("rts", this.dataSlowUpdate);
    document.removeEventListener("rtf", this.dataFastUpdate);
    document.removeEventListener("data", this.dataUpdate);

  },
  mounted() {
    this.$q.dark.set(true);

    // set local user
    this.user.loggedIn = true;
    this.user.name = "local user";

    // add event handlers to react on the model class
    try {
      document.removeEventListener("model_ready", this.modelReady);
    } catch {}
    document.addEventListener("model_ready", this.modelReady);

    try {
      document.removeEventListener("error", this.errorUpdate);
    } catch {}
    document.addEventListener("error", this.errorUpdate);

    // load the defaul model definition from disk
    explain.loadModelDefinitionFromDisk("term_neonate");








    try {
      document.removeEventListener("status", this.statusUpdate);
    } catch {}
    document.addEventListener("status", this.statusUpdate);

    try {
      document.removeEventListener("state", this.stateUpdate);
    } catch {}
    document.addEventListener("state", this.stateUpdate);

    try {
      document.removeEventListener("rts", this.dataSlowUpdate);
    } catch {}
    document.addEventListener("rts", this.dataSlowUpdate);

    try {
      document.removeEventListener("rtf", this.dataFastUpdate);
    } catch {}
    document.addEventListener("rtf", this.dataFastUpdate);

    try {
      document.removeEventListener("data", this.dataUpdate);
    } catch {}
    document.addEventListener("data", this.dataUpdate);


  },
});
</script>
<style scoped>
.black-background {
  background-color: black;
  min-height: 100vh;
  /* Ensures the background covers the whole page */
}
.headerCustomStyle {
  height: 30px !important;
  display: flex;
  align-items: center !important;
}
.footerCustomStyle {
  height: 30px !important;
  display: flex;
  align-items: center !important;
}
</style>
