<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import mermaid from "mermaid";
import { useMouseInElement } from "@vueuse/core";
import { UseFullscreen } from "@vueuse/components";

interface MermaidChartProps {
  code?: string;
}

const props = withDefaults(defineProps<MermaidChartProps>(), {
  code: "",
});

// ========== 响应式数据 ==========
const renderCode = computed(() => decodeURIComponent(props.code));
const renderChartHtml = ref<string>();
const mermaidRef = ref<HTMLElement>();
const zoomLevel = ref(1);
const dragOffset = ref({ x: 0, y: 0 });
const dragStart = ref({ x: 0, y: 0 });
const isDragging = ref(false);

// 使用 VueUse 检测鼠标是否在容器内
const { isOutside } = useMouseInElement(mermaidRef);

// ========== SVG 变换相关 ==========
const updateSvgTransform = () => {
  const svgEl = mermaidRef.value?.querySelector("svg");
  if (svgEl) {
    svgEl.style.transform = `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px) scale(${zoomLevel.value})`;
    svgEl.style.transformOrigin = "0 0";
    svgEl.style.willChange = "transform";
  }
};

// 容器拖拽处理
const onContainerMouseDown = (e: MouseEvent) => {
  // 忽略工具栏按钮的点击
  if ((e.target as HTMLElement).closest(".mermaid-toolbar")) {
    return;
  }

  isDragging.value = true;
  dragStart.value = { x: e.clientX, y: e.clientY };
  document.body.style.userSelect = "none";
  const startOffset = { ...dragOffset.value };

  let currentX = e.clientX;
  let currentY = e.clientY;
  let ticking = false;

  const update = () => {
    if (!isDragging.value) return;

    const dx = currentX - dragStart.value.x;
    const dy = currentY - dragStart.value.y;
    dragOffset.value = { x: startOffset.x + dx, y: startOffset.y + dy };
    updateSvgTransform();

    ticking = false;
  };

  const onMouseMove = (ev: MouseEvent) => {
    if (!isDragging.value) return;

    currentX = ev.clientX;
    currentY = ev.clientY;

    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  const onMouseUp = () => {
    isDragging.value = false;
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

// ========== 缩放相关 ==========
const ZOOM_SPEED = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

// 处理鼠标滚轮缩放
const onWheel = (e: WheelEvent) => {
  if (isOutside.value) return;

  e.preventDefault();

  const delta = e.deltaY;
  if (delta < 0) {
    zoomLevel.value = Math.min(zoomLevel.value * (1 + ZOOM_SPEED), MAX_ZOOM);
  } else {
    zoomLevel.value = Math.max(zoomLevel.value * (1 - ZOOM_SPEED), MIN_ZOOM);
  }

  updateSvgTransform();
};

// 重置视图
const resetView = () => {
  zoomLevel.value = 1;
  dragOffset.value = { x: 0, y: 0 };
  updateSvgTransform();
};

// ========== Mermaid 渲染 ==========
async function render() {
  if (!mermaidRef.value) return;

  mermaidRef.value.innerHTML = "";

  mermaid.initialize({
    startOnLoad: false,
    theme: document.documentElement.classList.contains("dark")
      ? "dark"
      : "default",
    securityLevel: "loose",
  });

  const id = Math.random().toString(36).substring(2, 15);
  const { svg } = await mermaid.render(
    `mermaid-${id}`,
    renderCode.value,
    mermaidRef.value
  );
  renderChartHtml.value = svg;

  nextTick(() => {
    const svgEl = mermaidRef.value?.querySelector("svg");
    if (svgEl) {
      updateSvgTransform();
    }
  });
}

// ========== 主题监听 ==========
const darkModeObserver = ref<MutationObserver>();

onMounted(() => {
  render();

  // 监听文档暗黑模式切换
  if (typeof window !== "undefined" && window.MutationObserver) {
    darkModeObserver.value = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.attributeName === "class" &&
          mutation.target === document.documentElement
        ) {
          render();
          break;
        }
      }
    });

    darkModeObserver.value.observe(document.documentElement, {
      attributes: true,
    });
  }

  // 监听窗口大小变化
  if (typeof window !== "undefined") {
    window.addEventListener("resize", resetView);
  }
});
</script>

<template>
  <div class="mermaid-container">
    <UseFullscreen v-slot="{ toggle, isFullscreen }">
      <div
        ref="mermaidRef"
        :class="['mermaid', isFullscreen && 'mermaid-fullscreen']"
        v-html="renderChartHtml"
        @wheel="onWheel"
        @mousedown="onContainerMouseDown"
      />
      <!-- 工具栏 -->
      <div class="mermaid-toolbar">
        <button class="toolbar-btn" title="重置视图" @click="resetView">
          🔁
        </button>
        <button class="toolbar-btn" title="全屏" @click="toggle">
          {{ isFullscreen ? "🔲" : "🔳" }}
        </button>
      </div>
    </UseFullscreen>
  </div>
</template>

<style lang="scss">
.mermaid {
  & > svg {
    width: 100%;
    max-width: 100% !important;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    /* stylelint-disable */
    transform: scale(v-bind(zoomLevel));
    transition: transform 0.3s ease;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }
}
</style>

<style lang="scss" scoped>
.mermaid-container {
  position: relative;

  &:hover .mermaid-toolbar {
    opacity: 1;
  }
}

.mermaid {
  width: 100%;
  height: 400px;
  margin: 16px 0;
  overflow: auto;
  cursor: grab;
  overflow: hidden;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: background-color 0.5s, border-color 0.5s;

  &:active {
    cursor: grabbing;
  }
}

.mermaid-toolbar {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  z-index: 10;
  display: flex;
  gap: 0.2rem;
  padding: 0.3rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.5rem;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  opacity: 0;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    transform: translateY(-2px);
    opacity: 1;
  }
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: var(--vp-c-brand);
    background: var(--vp-c-brand-dimm);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.mermaid-fullscreen {
  position: fixed;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: var(--vp-c-bg-soft);
  inset: 0;
}
</style>
