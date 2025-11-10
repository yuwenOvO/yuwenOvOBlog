<script setup lang="ts" name="TeekLayoutProvider">
import Teek, { clockIcon } from "vitepress-theme-teek";
import { useData } from "vitepress";
import { watch, nextTick, ref } from "vue";
import { useRibbon } from "../composables/useRibbon";
import { useRuntime } from "../composables/useRuntime";
import ContributeChart from "./ContributeChart.vue";
import NotFound from "./404.vue";

const { frontmatter } = useData();

// 彩带背景
const { start: startRibbon, stop: stopRibbon } = useRibbon({
  immediate: false,
});
// 页脚运行时间
const { start: startRuntime, stop: stopRuntime } = useRuntime(
  "2025-11-03 00:00:00",
  {
    prefix: `<span style="width: 16px; display: inline-block; vertical-align: -3px; margin-right: 3px;">${clockIcon}</span>小破站已运行 `,
  }
);

const watchRuntimeAndRibbon = async (layout: string) => {
  const isHome = layout === "home";

  // 博客类风格的首页显示运行时间
  await nextTick();
  if (isHome) startRuntime();
  else stopRuntime();

  // 博客类风格的首页显示彩带 & 设置了 pageStyle 的文章页显示彩带
  if (isHome) startRibbon();
  else stopRibbon();
};

watch(frontmatter, (newVal) => watchRuntimeAndRibbon(newVal.layout), {
  immediate: true,
  flush: "post",
});
</script>

<template>
  <Teek.Layout>
    <template #teek-archives-top-before>
      <ContributeChart />
    </template>

    <template #not-found>
      <NotFound />
    </template>
  </Teek.Layout>
</template>

<style lang="scss">
.tk-my.is-circle-bg {
  .tk-my__avatar.circle-rotate {
    margin-top: 200px;

    .tk-avatar:not(.avatar-sticker) {
      border: 5px solid var(--vp-c-bg-elv);
    }
  }
}
</style>
