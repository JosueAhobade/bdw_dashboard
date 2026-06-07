<template>
  <AdminLayout>
    <div v-if="loading" class="p-6 text-gray-500">
      Chargement des statistiques...
    </div>

    <div v-else class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics :stats="stats" />
        <MonthlyTarget :stats="stats" />
      </div>

      <div class="col-span-12 xl:col-span-5">
        <MonthlySale :stats="stats" />
      </div>

      <div class="col-span-12">
        <StatisticsChart :stats="stats" />
      </div>

      <div class="col-span-12 xl:col-span-7">
        <RecentOrders :stats="stats" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import AdminLayout from '../components/layout/AdminLayout.vue'
import EcommerceMetrics from '../components/ecommerce/EcommerceMetrics.vue'
import MonthlyTarget from '../components/ecommerce/MonthlyTarget.vue'
import MonthlySale from '../components/ecommerce/MonthlySale.vue'
import StatisticsChart from '../components/ecommerce/StatisticsChart.vue'
import RecentOrders from '../components/ecommerce/RecentOrders.vue'

import { getStatistics } from '../services/statisticsService'

const stats = ref(null)
const loading = ref(false)

const fetchStatistics = async () => {
  loading.value = true

  try {
    stats.value = await getStatistics()
  } catch (error) {
    console.error('Erreur chargement statistiques:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>