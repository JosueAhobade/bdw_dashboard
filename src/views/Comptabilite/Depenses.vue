<template>
  <!-- MODAL -->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl w-full max-w-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">
          Nouvelle dépense
        </h2>

        <button @click="showModal = false" class="text-gray-500 hover:text-black">
          ✕
        </button>
      </div>

      <form @submit.prevent="submitDepense" class="space-y-4">

        <!-- Montant -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Montant
          </label>

          <input v-model="form.montant" type="number" class="w-full border rounded-lg px-3 py-2" required />
        </div>

        <!-- Devise -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Devise
          </label>

          <select v-model="form.devise" class="w-full border rounded-lg px-3 py-2">
            <option value="XOF">XOF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <!-- Type -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Type dépense
          </label>

          <input v-model="form.type_depense" type="text" class="w-full border rounded-lg px-3 py-2" placeholder="achat"
            required />
        </div>

        <!-- Description -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Description
          </label>

          <textarea v-model="form.description" class="w-full border rounded-lg px-3 py-2"></textarea>
        </div>

        <!-- Date -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Date
          </label>

          <input v-model="form.date_depense" type="date" class="w-full border rounded-lg px-3 py-2" required />
        </div>

        <!-- Status -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Status
          </label>

          <select v-model="form.status" class="w-full border rounded-lg px-3 py-2">
            <option value="succès">Succès</option>
            <option value="en attente">En attente</option>
            <option value="échec">Échec</option>
          </select>
        </div>

        <!-- Boutons -->
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="showModal = false" class="border px-4 py-2 rounded-lg">
            Annuler
          </button>

          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl w-full max-w-lg p-6">

      <div class="flex justify-between mb-4">
        <h2 class="text-xl font-bold">Détails dépense</h2>

        <button @click="showDetailModal = false">✕</button>
      </div>

      <div v-if="selectedDepense" class="space-y-3 text-sm">

        <p><strong>ID:</strong> #{{ selectedDepense.id }}</p>

        <p><strong>Montant:</strong> {{ selectedDepense.montant }} {{ selectedDepense.devise }}</p>

        <p><strong>Type:</strong> {{ selectedDepense.type_depense }}</p>

        <p>
          <strong>Description:</strong>
          {{ selectedDepense.description || "Aucune description" }}
        </p>

        <p><strong>Status:</strong> {{ selectedDepense.status }}</p>

        <p><strong>Date:</strong> {{ selectedDepense.date_depense }}</p>

        <p>
          <strong>Employé:</strong>
          {{ selectedDepense.employe?.nom || "Non défini" }}
        </p>

        <p><strong>Créé le:</strong> {{ selectedDepense.created_at }}</p>

      </div>

    </div>
  </div>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleImport" />
      <ComponentCard title="Basic Table 1" label_btn="Créer une dépense" label_filter_btn="Filtrer"
        label_import_btn="Importer" @action="showModal = true" @import="openImport">
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
                <tr v-for="(depense, index) in paginatedDepenses" :key="depense.id"
                  class="border-t border-gray-100 dark:border-gray-800">
                  <!-- N° facture -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="font-medium text-gray-800 dark:text-white">
                      #FAC-{{ depense.id }}
                    </p>
                  </td>

                  <!-- Fournisseur -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ depense.employe?.nom || "Non défini" }}
                    </p>
                  </td>

                  <!-- Type achat -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ depense.type_depense }}
                    </p>
                  </td>

                  <!-- Description -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ shortText(depense.description) }}
                    </p>
                  </td>

                  <!-- Montant -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="font-medium text-gray-800 dark:text-white">
                      {{ depense.montant }} {{ depense.devise }}
                    </p>
                  </td>

                  <!-- Status -->
                  <td class="px-5 py-4 sm:px-6">
                    <span :class="[
                      'rounded-full px-2 py-1 text-xs font-medium',
                      {
                        'bg-success-50 text-success-700':
                          depense.status === 'succès',

                        'bg-warning-50 text-warning-700':
                          depense.status === 'en attente',

                        'bg-error-50 text-error-700':
                          depense.status === 'échec',
                      },
                    ]">
                      {{ depense.status }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ depense.date_depense }}
                    </p>
                  </td>

                  <!-- Actions -->
                  <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                      <button class="text-blue-500 hover:underline border border-blue-500 px-2 py-1 rounded"
                        @click="openDetail(depense)">
                        Voir
                      </button>

                      <button class="text-green-500 hover:underline border border-green-500 px-2 py-1 rounded"
                        @click="editDepense(depense)">
                        Modifier
                      </button>

                      <button class="text-red-500 hover:underline border border-red-500 px-2 py-1 rounded"
                        @click="removeDepense(depense)">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="flex items-center justify-between px-5 py-4">
              <p class="text-sm text-gray-500">
                Page {{ currentPage }} sur {{ totalPages }}
              </p>

              <div class="flex gap-2">
                <button class="border px-3 py-1 rounded disabled:opacity-50" :disabled="currentPage === 1"
                  @click="currentPage--">
                  Précédent
                </button>

                <button class="border px-3 py-1 rounded disabled:opacity-50" :disabled="currentPage === totalPages"
                  @click="currentPage++">
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import * as XLSX from "xlsx";

import { getAllDepenses, createDepense, updateDepense, deleteDepense } from "@/services/depensesService";

const currentPageTitle = ref("Suivi des dépenses");

const depenses = ref([]);

const showModal = ref(false);

const isEditing = ref(false);
const editingId = ref(null);

const form = ref({
  montant: "",
  devise: "XOF",
  type_depense: "",
  description: "",
  date_depense: "",
  status: "succès",
});

const fetchDepenses = async () => {
  try {
    const response = await getAllDepenses();

    // IMPORTANT
    depenses.value = response.data;

    console.log(depenses.value);
  } catch (error) {
    console.error("Erreur API :", error);
  }
};

const submitDepense = async () => {
  try {
    if (isEditing.value) {
      await updateDepense(editingId.value, form.value);
      alert("Dépense modifiée avec succès");
    } else {
      await createDepense(form.value);
      alert("Dépense créée avec succès");
    }
    // recharge les dépenses
    await fetchDepenses();
    currentPage.value = 1;

    // reset formulaire
    form.value = {
      montant: "",
      devise: "XOF",
      type_depense: "",
      description: "",
      date_depense: "",
      status: "succès",
    };

    // fermer modal
    showModal.value = false;
    isEditing.value = false;
    editingId.value = null;

  } catch (error) {
    console.error(error);
    alert("Erreur création dépense");
  }
};

const editDepense = (depense) => {
  isEditing.value = true;
  editingId.value = depense.id;

  form.value = {
    montant: depense.montant,
    devise: depense.devise,
    type_depense: depense.type_depense,
    description: depense.description,
    date_depense: depense.date_depense,
    status: depense.status,
  };

  showModal.value = true;
};

const removeDepense = async (depense) => {
  if (!confirm(`Supprimer la dépense #FAC-${depense.id} ?`)) return;

  try {
    await deleteDepense(depense.id);

    await fetchDepenses();
    currentPage.value = 1;

    alert("Dépense supprimée avec succès");
  } catch (error) {
    console.error(error);
    alert("Erreur suppression dépense");
  }
};

const selectedDepense = ref(null);
const showDetailModal = ref(false);

const openDetail = (depense) => {
  selectedDepense.value = depense;
  showDetailModal.value = true;
};

const shortText = (text, max = 30) => {
  if (!text) return "-";
  return text.length > max ? text.slice(0, max) + "..." : text;
};


const fileInput = ref(null);

const openImport = () => {
  fileInput.value.click();
};

const handleImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    const depensesToImport = rows.map((row) => ({
      montant: row.montant || row.Montant,
      devise: row.devise || row.Devise || "XOF",
      type_depense: row.type_depense || row["Type dépense"] || row.Type,
      description: row.description || row.Description || "",
      date_depense: row.date_depense || row.Date,
      status: row.status || row.Status || "succès",
    }));

    for (const depense of depensesToImport) {
      await createDepense(depense);
    }

    await fetchDepenses();
    currentPage.value = 1;

    alert("Import terminé avec succès");
  } catch (error) {
    console.error(error);
    alert("Erreur pendant l'import");
  } finally {
    event.target.value = "";
  }
};

const currentPage = ref(1);
const perPage = ref(5);

const totalPages = computed(() => {
  return Math.ceil(depenses.value.length / perPage.value) || 1;
});

const paginatedDepenses = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;

  return depenses.value.slice(start, end);
});

onMounted(() => {
  fetchDepenses();
  currentPage.value = 1;
});
</script>
