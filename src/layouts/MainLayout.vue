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
    }
  },
  beforeUnmount() {
    // remove the event handlers
    document.removeEventListener("status", this.updateStatusMessage);
    document.removeEventListener("model_ready", () => this.$bus.emit("model_ready"));
    document.removeEventListener("error", () => this.$bus.emit("model_failed"));
    document.removeEventListener("rt_start", () => this.$bus.emit("rt_start"));
    document.removeEventListener("rt_stop", () => this.$bus.emit("rt_stop"));
    document.removeEventListener("rts", () => this.$bus.emit("rts"));
    document.removeEventListener("rtf", () => this.$bus.emit("rtf"));
    document.removeEventListener("state", () => this.$bus.emit("state"));
    document.removeEventListener("data", () => this.$bus.emit("data"));
    document.removeEventListener("data_slow", () => this.$bus.emit("data_slow"));
  },
  mounted() {
    this.$q.dark.set(true);

    // set local user
    this.user.loggedIn = true;
    this.user.name = "local user";

    // add the event handlers on the model class
    try {
      document.removeEventListener("status", this.updateStatusMessage);
    } catch {}
    document.addEventListener("status", this.updateStatusMessage);

    try {
      document.removeEventListener("model_ready", () => this.$bus.emit("model_ready"));
    } catch {}
    document.addEventListener("model_ready", () => this.$bus.emit("model_ready"));

    try {
      document.removeEventListener("error", () => this.$bus.emit("model_failed"));
    } catch {}
    document.addEventListener("error", () => this.$bus.emit("model_failed"));

    try {
      document.removeEventListener("rt_start", () => this.$bus.emit("rt_start"));
    } catch {}
    document.addEventListener("rt_start", () => this.$bus.emit("rt_start"));

    try {
      document.removeEventListener("rt_stop", () => this.$bus.emit("rt_stop"));
    } catch {}
    document.addEventListener("rt_stop", () => this.$bus.emit("rt_stop"));

    try {
      document.removeEventListener("rts", () => this.$bus.emit("rts"));
    } catch {}
    document.addEventListener("rts", () => this.$bus.emit("rts"));

    try {
      document.removeEventListener("rtf", () => this.$bus.emit("rtf"));
    } catch {}
    document.addEventListener("rtf", () => this.$bus.emit("rtf"));

    try {
      document.removeEventListener("state", () => this.$bus.emit("state"));
    } catch {}
    document.addEventListener("state", () => this.$bus.emit("state"));

    try {
      document.removeEventListener("data", () => this.$bus.emit("data"));
    } catch {}
    document.addEventListener("data", () => this.$bus.emit("data"));

    try {
      document.removeEventListener("data_slow", () => this.$bus.emit("data_slow"));
    } catch {}
    document.addEventListener("data_slow", () => this.$bus.emit("data_slow"));

    // load the defaul model definition from disk
    explain.load("term_neonate");

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
