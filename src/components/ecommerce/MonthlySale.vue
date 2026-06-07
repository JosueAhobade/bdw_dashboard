<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recettes mensuelles
        </h3>
        <p class="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Évolution des recettes sur l'année
        </p>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" class="-ml-5 min-w-[650px] xl:min-w-full pl-2">
        <VueApexCharts
          type="bar"
          height="180"
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

const monthlyData = computed<MonthlyItem[]>(() => {
  return props.stats?.monthly ?? []
})

const series = computed(() => [
  {
    name: 'Recettes',
    data: monthlyData.value.map((item: MonthlyItem) => Number(item.recettes || 0)),
  },
])

const formatMoney = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const chartOptions = computed(() => ({
  colors: ['#22c55e'],
  chart: {
    fontFamily: 'Outfit, sans-serif',
    type: 'bar',
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '39%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 4,
    colors: ['transparent'],
  },
  xaxis: {
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
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Outfit',
    markers: {
      radius: 99,
    },
  },
  yaxis: {
    labels: {
      formatter: function (value: number) {
        return formatMoney(value)
      },
    },
    title: {
      text: undefined,
    },
  },
  grid: {
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    x: {
      show: false,
    },
    y: {
      formatter: function (value: number) {
        return formatMoney(value)
      },
    },
  },
}))
</script>