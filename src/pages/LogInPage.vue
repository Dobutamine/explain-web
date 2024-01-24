<template>
  <q-page padding class="bg-black">
    LOGIN PAGE
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LogInPage',
  setup(){},
  data() {
    return {}
  },
  methods: {
  },
  beforeUnmount() {},
  mounted() {
    this.$q.dark.set(true);
  }
})
</script>
