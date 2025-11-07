<script setup lang="ts">
import Header from "./Header.vue";
import { Repl, useStore } from "@vue/repl";
import Monaco from "@vue/repl/monaco-editor";
import { ref, watchEffect, onMounted } from "vue";

const replRef = ref<InstanceType<typeof Repl>>();

const setVH = () => {
  document.documentElement.style.setProperty("--vh", window.innerHeight + `px`);
};
window.addEventListener("resize", setVH);
setVH();

const hash = location.hash.slice(1);

const store = useStore({}, hash);
// @ts-expect-error
globalThis.store = store;

store.setImportMap({
  imports: {
    vue: "https://play.vuejs.org/vue.runtime.esm-browser.js",
    "vue/server-renderer":
      "https://play.vuejs.org/server-renderer.esm-browser.js",
    antvg2plot: "https://cdn.jsdelivr.net/npm/@antv/g2plot@2.4.35/+esm",
  },
});

// persist state
watchEffect(() => {
  const newHash = store.serialize();
  history.replaceState({}, "", newHash);
});

function reloadPage() {
  replRef.value?.reload();
}

const theme = ref<"dark" | "light">("dark");
function toggleTheme(isDark: boolean) {
  theme.value = isDark ? "dark" : "light";
}
onMounted(() => {
  const cls = document.documentElement.classList;
  toggleTheme(cls.contains("dark"));

  // @ts-expect-error process shim for old versions of @vue/compiler-sfc dependency
  window.process = { env: {} };
});
</script>

<template>
  <Header
    :store="store"
    :theme="theme"
    @toggle-theme="toggleTheme"
    @reload-page="reloadPage"
  />
  <Repl
    ref="replRef"
    :theme="theme"
    :editor="Monaco"
    @keydown.ctrl.s.prevent
    @keydown.meta.s.prevent
    :editorOptions="{ autoSaveText: false }"
    :store="store"
    :showCompileOutput="true"
    :showOpenSourceMap="true"
    :autoResize="true"
    :clearConsole="false"
  />
</template>

<style>
.dark {
  color-scheme: dark;
}

body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}

.vue-repl {
  height: calc(var(--vh) - var(--nav-height)) !important;
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
