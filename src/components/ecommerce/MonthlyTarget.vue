<template>
  <div
    class="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div
      class="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6"
    >
      <div class="flex justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
            Rentabilité globale
          </h3>
          <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Part du solde positif par rapport aux recettes
          </p>
        </div>
      </div>

      <div class="relative max-h-[195px]">
        <div id="chartTwo" class="h-full">
          <div class="radial-bar-chart">
            <VueApexCharts
              type="radialBar"
              height="330"
              :options="chartOptions"
              :series="series"
            />
          </div>
        </div>

        <span
          :class="[
            'absolute left-1/2 top-[85%] -translate-x-1/2 -translate-y-[85%] rounded-full px-3 py-1 text-xs font-medium',
            solde >= 0
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
          ]"
        >
          {{ solde >= 0 ? 'Solde positif' : 'Solde négatif' }}
        </span>
      </div>

      <p class="mx-auto mt-1.5 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
        {{ message }}
      </p>
    </div>

    <div class="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
      <div>
        <p class="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
          Recettes
        </p>
        <p class="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
          {{ formatMoney(totalRecettes) }}
        </p>
      </div>

      <div class="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

      <div>
        <p class="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
          Dépenses
        </p>
        <p class="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
          {{ formatMoney(totalDepenses) }}
        </p>
      </div>

      <div class="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

      <div>
        <p class="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
          Solde
        </p>
        <p
          :class="[
            'text-base font-semibold sm:text-lg',
            solde >= 0
              ? 'text-success-600 dark:text-success-500'
              : 'text-error-600 dark:text-error-500',
          ]"
        >
          {{ formatMoney(solde) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

type Statistics = {
  total_recettes?: number
  total_depenses?: number
  solde?: number
}

const props = defineProps<{
  stats: Statistics | null
}>()

const totalRecettes = computed(() => Number(props.stats?.total_recettes || 0))
const totalDepenses = computed(() => Number(props.stats?.total_depenses || 0))
const solde = computed(() => Number(props.stats?.solde || 0))

const rentabilite = computed(() => {
  if (totalRecettes.value <= 0) return 0

  const value = (solde.value / totalRecettes.value) * 100

  return Math.max(0, Math.min(value, 100))
})

const series = computed(() => [Number(rentabilite.value.toFixed(2))])

const message = computed(() => {
  if (totalRecettes.value <= 0) {
    return 'Aucune recette enregistrée pour le moment.'
  }

  if (solde.value >= 0) {
    return `Votre solde actuel est positif : ${formatMoney(solde.value)}.`
  }

  return `Votre solde actuel est négatif : ${formatMoney(solde.value)}.`
})

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const chartOptions = {
  colors: ['#465FFF'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    sparkline: {
      enabled: true,
    },
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        size: '80%',
      },
      track: {
        background: '#E4E7EC',
        strokeWidth: '100%',
        margin: 5,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          fontSize: '36px',
          fontWeight: '600',
          offsetY: 60,
          color: '#1D2939',
          formatter: function (val: number) {
            return val.toFixed(2) + '%'
          },
        },
      },
    },
  },
  fill: {
    type: 'solid',
    colors: ['#465FFF'],
  },
  stroke: {
    lineCap: 'round',
  },
  labels: ['Rentabilité'],
}
</script>

<style scoped>
.radial-bar-chart {
  width: 100%;
  max-width: 330px;
  margin: 0 auto;
}
</style>