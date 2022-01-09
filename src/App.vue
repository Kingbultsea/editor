<script lang="ts">
import { defineComponent } from 'vue'
import Editor from '@components/Editor/Editor.vue'
export default defineComponent({
  components: {
    Editor
  }
})
</script>

<template>
  <Editor />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 20px 10px;
  box-sizing: border-box;
  height: 100vh;
  max-width: 800px;
}

body {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}
</style>
