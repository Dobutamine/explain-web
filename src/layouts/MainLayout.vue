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
    updateStatusMessage(e) {
      this.statusMessage = "STATUS: " + explain.status_message
    },
    modelReady() {
      this.$bus.emit("model_ready")
    },
    modelError() {
      this.$bus.emit("model_failed")
    },
    rtStart() {
      this.$bus.emit("rt_start")
    },
    rtStop() {
      this.$bus.emit("rt_stop")
    }
  },
  beforeUnmount() {
    document.removeEventListener("status", this.updateStatusMessage);
    document.removeEventListener("model_ready", this.modelReady);
    document.removeEventListener("error", this.modelError);
    document.removeEventListener("rt_start", this.rtStart);
    document.removeEventListener("rt_stop", this.rtStop);

  },
  mounted() {
    this.$q.dark.set(true);

    // set local user
    this.user.loggedIn = true;
    this.user.name = "local user";

    // add event handlers on the model class
    try {
      document.removeEventListener("status", this.updateStatusMessage);
    } catch {}
    document.addEventListener("status", this.updateStatusMessage);

    try {
      document.removeEventListener("model_ready", this.modelReady);
    } catch {}
    document.addEventListener("model_ready", this.modelReady);

    try {
      document.removeEventListener("error", this.modelError);
    } catch {}
    document.addEventListener("error", this.modelError);

    try {
      document.removeEventListener("rt_start", this.rtStart);
    } catch {}
    document.addEventListener("rt_start", this.rtStart);

    try {
      document.removeEventListener("rt_stop", this.rtStop);
    } catch {}
    document.addEventListener("rt_stop", this.rtStop);

    // load the defaul model definition from disk
    explain.loadModelDefinition("term_neonate");

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
