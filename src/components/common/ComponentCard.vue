<template>
  <div
    :class="[
      'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
      className,
    ]"
  >
    <!-- Card Header -->
    <div class="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
      <div>
        <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
          {{ title }}
        </h3>
        <p v-if="desc" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ desc }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="label_filter_btn"
          type="button"
          class="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
          {{ label_filter_btn }}
        </button>
        <button
          v-if="label_import_btn"
          type="button"
          class="inline-flex items-center rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600">
          {{ label_import_btn }}
        </button>
        <button
          v-if="label_btn"
          type="button"
          @click="$emit('action')"
          class="inline-flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600">
          {{ label_btn }}
        </button>
      </div>
      
    </div>

    <!-- Card Body -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
      <div class="space-y-5">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  title: string
  className?: string
  desc?: string
  label_btn?: string
  label_filter_btn?: string
  label_import_btn?: string
}

defineProps<Props>()

const emit = defineEmits(["action"]);
</script>
