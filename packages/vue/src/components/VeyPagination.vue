<script setup lang="ts">
import type { VeyGlassValue } from "../glass";
import { useGlass } from "../internal/use-glass";
import { computed, type PropType } from "vue";

/**
 * @file VeyPagination.vue
 * @description Veydeck 平台自研分页组件，严格遵循 VDL 设计规范。
 */

const props = defineProps({
  glass: {
    type: [Boolean, Object] as PropType<VeyGlassValue>,
    default: undefined,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  maxVisibleButtons: {
    type: Number,
    default: 5,
  },
  ariaLabel: { type: String, default: "Pagination" },
  previousLabel: { type: String, default: "Previous page" },
  nextLabel: { type: String, default: "Next page" },
});

const emit = defineEmits(["page-change"]);

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const max = props.maxVisibleButtons;
  const r: (number | string)[] = [];

  if (total <= max) {
    for (let i = 1; i <= total; i++) {
      r.push(i);
    }
  } else {
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, current + half);

    if (current - start < half) {
      end += half - (current - start);
    }
    if (end - current < half) {
      start -= half - (end - current);
    }

    start = Math.max(1, start);
    end = Math.min(total, end);

    if (start > 1) {
      r.push(1);
      if (start > 2) {
        r.push("...");
      }
    }
    for (let i = start; i <= end; i++) {
      r.push(i);
    }
    if (end < total) {
      if (end < total - 1) {
        r.push("...");
      }
      r.push(total);
    }
  }
  return r;
});

function changePage(page: number | string) {
  if (typeof page === "number" && page !== props.currentPage) {
    emit("page-change", page);
  }
}
const vGlass = useGlass(() => props.glass, "control");
</script>

<template>
  <nav class="vl-pagination" v-if="totalPages > 1" :aria-label="ariaLabel">
    <button
      v-glass
      class="vl-pagination-btn"
      type="button"
      :aria-label="previousLabel"
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      &lt;
    </button>
    <template v-for="(page, index) in pages" :key="index">
      <span
        v-if="typeof page === 'string'"
        class="vl-pagination-ellipsis"
        aria-hidden="true"
        >…</span
      >
      <button
        v-else
        type="button"
        v-glass
        class="vl-pagination-btn"
        :class="{
          active: page === currentPage,
        }"
        :aria-current="page === currentPage ? 'page' : undefined"
        :aria-label="`Page ${page}`"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </template>
    <button
      v-glass
      class="vl-pagination-btn"
      type="button"
      :aria-label="nextLabel"
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      &gt;
    </button>
  </nav>
</template>

<style scoped>
.vl-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--vdl-space-2);
}
.vl-pagination-ellipsis {
  min-width: 32px;
  text-align: center;
  color: var(--vdl-text-muted);
}
.vl-pagination-btn:focus-visible {
  outline: none;
  box-shadow: var(--vdl-focus-ring);
}

.vl-pagination-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 var(--vdl-space-2);
  border: 1px solid var(--vdl-border-default);
  background-color: var(--vdl-bg-card);
  color: var(--vdl-text-secondary);
  cursor: pointer;
  border-radius: var(--vdl-radius-md);
  font-size: var(--vdl-font-body-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vl-pagination-btn:hover:not(:disabled) {
  background-color: var(--vdl-bg-hover);
  border-color: var(--vdl-border-brand);
  color: var(--vdl-text-primary);
}

.vl-pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.vl-pagination-btn.active {
  background-color: var(--vdl-primary);
  color: var(--vdl-text-inverse);
  border-color: var(--vdl-primary);
  font-weight: 600;
}

.vl-pagination-btn.ellipsis {
  border: none;
  background-color: transparent;
  cursor: default;
}
</style>
