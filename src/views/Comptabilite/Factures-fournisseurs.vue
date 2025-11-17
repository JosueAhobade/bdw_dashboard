<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard 
        title="Basic Table 1"
        desc="This is a basic table example."
        label_btn="Créer une dépense"
        label_filter_btn="Filtrer"
        label_import_btn="Importer"
        >
          <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full responsive-table">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-5 py-3 text-left w-3/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">N° facture</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fournisseur</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Type d'achat</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Description</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Montant HT</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Date</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(user, index) in users"
            :key="index"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 overflow-hidden rounded-full">
                  <img :src="user.avatar" :alt="user.name" />
                </div>
                <div>
                  <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {{ user.name }}
                  </span>
                  <span class="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {{ user.role }}
                  </span>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.project }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex -space-x-2">
                <div
                  v-for="(member, memberIndex) in user.team"
                  :key="memberIndex"
                  class="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                >
                  <img :src="member" alt="team member" />
                </div>
              </div>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span
                :class="[
                  'rounded-full px-2 py-0.5 text-theme-xs font-medium',
                  {
                    'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500':
                      user.status === 'Active',
                    'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400':
                      user.status === 'Pending',
                    'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500':
                      user.status === 'Cancel',
                  },
                ]"
              >
                {{ user.status }}
              </span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.budget }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from "@/components/common/ComponentCard.vue";
import BasicTableOne from "@/components/tables/basic-tables/BasicTableOne.vue";

const currentPageTitle = ref('Factures fournisseurs')
const users = ref([
  {
    name: 'Lindsey Curtis',
    role: 'Web Designer',
    avatar: '/images/user/user-17.jpg',
    project: 'Agency Website',
    team: ['/images/user/user-22.jpg', '/images/user/user-23.jpg', '/images/user/user-24.jpg'],
    status: 'Active',
    budget: '3.9K',
  },
])
import { ref } from 'vue'
</script>
