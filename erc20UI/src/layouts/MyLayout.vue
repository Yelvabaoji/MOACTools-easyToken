<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header elevated> -->
    <q-header>
      <q-toolbar class="bg-white text-black">
        <q-toolbar-title class="text-center">
          <strong>墨客一键发币</strong>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MyLayout',
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style>
</style>
