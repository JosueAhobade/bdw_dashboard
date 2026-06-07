<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
  >
    <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Dernières recettes
        </h3>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-t border-gray-100 dark:border-gray-800">
            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Type</p>
            </th>

            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Mode paiement</p>
            </th>

            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Montant</p>
            </th>

            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Statut</p>
            </th>

            <th class="py-3 text-left">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Date</p>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="recettes.length === 0">
            <td colspan="5" class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucune recette récente.
            </td>
          </tr>

          <tr
            v-for="recette in recettes"
            :key="recette.id"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="py-3 whitespace-nowrap">
              <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {{ recette.type_recette || 'Recette' }}
              </p>
              <span class="text-gray-500 text-theme-xs dark:text-gray-400">
                {{ shortDescription(recette.description) }}
              </span>
            </td>

            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                {{ recette.mode_paiement || '-' }}
              </p>
            </td>

            <td class="py-3 whitespace-nowrap">
              <p class="font-medium text-success-600 text-theme-sm dark:text-success-500">
                {{ formatMoney(recette.montant) }}
              </p>
            </td>

            <td class="py-3 whitespace-nowrap">
              <span :class="statusClass(recette.status)">
                {{ recette.status || 'N/A' }}
              </span>
            </td>

            <td class="py-3 whitespace-nowrap">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                {{ formatDate(recette.date_recette) }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    default: null,
  },
})

const recettes = computed(() => {
  return props.stats?.recent_recettes || []
})

const formatMoney = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0)
}

const formatDate = (date) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

const shortDescription = (description) => {
  if (!description) return 'Aucune description'

  return description.length > 45
    ? description.substring(0, 45) + '...'
    : description
}

const statusClass = (status) => {
  const base = 'rounded-full px-2 py-0.5 text-theme-xs font-medium'

  if (status === 'succès' || status === 'success' || status === 'payé') {
    return `${base} bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500`
  }

  if (status === 'en attente' || status === 'pending') {
    return `${base} bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400`
  }

  if (status === 'échec' || status === 'failed' || status === 'annulé') {
    return `${base} bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500`
  }

  return `${base} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`
}
</script>