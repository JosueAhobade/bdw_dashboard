<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
      <div class="w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Évolution financière
        </h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Recettes et dépenses par mois
        </p>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartThree" class="-ml-4 min-w-[1000px] xl:min-w-full pl-2">
        <VueApexCharts
          type="area"
          height="310"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

type MonthlyItem = {
  month: number
  recettes: number
  depenses: number
}

type Statistics = {
  monthly?: MonthlyItem[]
}

const props = defineProps<{
  stats: Statistics | null
}>()

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const monthlyData = computed<MonthlyItem[]>(() => {
  return props.stats?.monthly ?? []
})

const series = computed(() => [
  {
    name: 'Recettes',
    data: monthlyData.value.map((item: MonthlyItem) => Number(item.recettes || 0)),
  },
  {
    name: 'Dépenses',
    data: monthlyData.value.map((item: MonthlyItem) => Number(item.depenses || 0)),
  },
])

const chartOptions = computed(() => ({
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#22c55e', '#ef4444'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'area',
    toolbar: {
      show: false,
    },
  },
  fill: {
    gradient: {
      enabled: true,
      opacityFrom: 0.45,
      opacityTo: 0,
    },
  },
  stroke: {
    curve: 'smooth',
    width: [2, 2],
  },
  markers: {
    size: 0,
  },
  grid: {
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: function (value: number) {
        return formatMoney(value)
      },
    },
  },
  xaxis: {
    type: 'category',
    categories: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    labels: {
      formatter: function (value: number) {
        return formatMoney(value)
      },
    },
    title: {
      style: {
        fontSize: '0px',
      },
    },
  },
}))
</script>

<style scoped>
.area-chart {
  width: 100%;
}
</style>