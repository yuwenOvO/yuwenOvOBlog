<script setup lang="ts">
import type { ReplStore } from "@vue/repl";
import { downloadProject } from "./download/download";
import Sun from "./icons/Sun.vue";
import Moon from "./icons/Moon.vue";
import Share from "./icons/Share.vue";
import Download from "./icons/Download.vue";
import GitHub from "./icons/GitHub.vue";
import Reload from "./icons/Reload.vue";

const props = defineProps<{
  store: ReplStore;
  theme: "dark" | "light";
}>();
const emit = defineEmits(["toggle-theme", "reload-page"]);

const { store } = props;

async function copyLink(e: MouseEvent) {
  if (e.metaKey) {
    // hidden logic for going to local debug from play.vuejs.org
    window.location.href = "http://localhost:5173/" + window.location.hash;
    return;
  }
  await navigator.clipboard.writeText(location.href);
  alert("Sharable URL has been copied to clipboard.");
}

function toggleDark() {
  const cls = document.documentElement.classList;
  cls.toggle("dark");
  localStorage.setItem(
    "vue-sfc-playground-prefer-dark",
    String(cls.contains("dark"))
  );
  emit("toggle-theme", cls.contains("dark"));
}
</script>

<template>
  <nav>
    <h1>
      <img alt="logo" src="/logo.svg" />
      <span>Vue SFC Playground</span>
    </h1>
    <div class="links">
      <button
        :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
        class="toggle-dark"
        @click="toggleDark"
      >
        <Sun class="light" />
        <Moon class="dark" />
      </button>
      <button title="Copy sharable URL" class="share" @click="copyLink">
        <Share />
      </button>
      <button title="Reload page" class="reload" @click="$emit('reload-page')">
        <Reload />
      </button>
      <button
        title="Download project files"
        class="download"
        @click="downloadProject(store)"
      >
        <Download />
      </button>
      <a
        href="https://github.com/vuejs/core/tree/main/packages-private/sfc-playground"
        target="_blank"
        title="View on GitHub"
        class="github"
      >
        <GitHub />
      </a>
    </div>
  </nav>
</template>

<style>
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --btn: #666;
  --highlight: #333;
  --green: #3ca877;
  --purple: #904cbc;
  --btn-bg: #eee;

  color: var(--base);
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  background-color: var(--bg);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}

.dark nav {
  --base: #ddd;
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --highlight: #fff;
  --btn-bg: #333;

  box-shadow: none;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-weight: 500;
  display: inline-flex;
  place-items: center;
}

h1 img {
  height: 24px;
  margin-right: 10px;
}

@media (max-width: 560px) {
  h1 span {
    font-size: 0.9em;
  }
}

@media (max-width: 520px) {
  h1 span {
    display: none;
  }
}

.links {
  display: flex;
}

.toggle-prod span {
  background: var(--green);
  color: #fff;
}

.toggle-prod.prod span {
  background: var(--purple);
}

.toggle-dark svg {
  width: 18px;
  height: 18px;
}

.toggle-dark .dark,
.dark .toggle-dark .light {
  display: none;
}

.dark .toggle-dark .dark {
  display: inline-block;
}

.links button,
.links .github {
  padding: 1px 6px;
  color: var(--btn);
}

.links button:hover,
.links .github:hover {
  color: var(--highlight);
}

.version:hover .active-version::after {
  border-top-color: var(--btn);
}

.dark .version:hover .active-version::after {
  border-top-color: var(--highlight);
}

.links > * {
  display: flex;
  align-items: center;
}

.links > * + * {
  margin-left: 4px;
}
</style>
