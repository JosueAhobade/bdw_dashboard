<template>
  <!-- MODAL -->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-2xl w-full max-w-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">
          Nouvelle recette
        </h2>

        <button @click="showModal = false" class="text-gray-500 hover:text-black">
          ✕
        </button>
      </div>

      <form @submit.prevent="submitRecette" class="space-y-4">

        <!-- Montant -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Montant
          </label>

          <input v-model="form.montant" type="number" class="w-full border rounded-lg px-3 py-2" required />
        </div>

        <!-- Type -->
        <div>
          <label class="block mb-1 text-sm font-medium">
            Type recette
          </label>

          <input v-model="form.type_recette" type="text" class="w-full border rounded-lg px-3 py-2" placeholder="vente, service, etc."
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

          <input v-model="form.date_recette" type="date" class="w-full border rounded-lg px-3 py-2" required />
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
        <h2 class="text-xl font-bold">Détails recette</h2>

        <button @click="showDetailModal = false">✕</button>
      </div>

      <div v-if="selectedRecette" class="space-y-3 text-sm">

        <p><strong>ID:</strong> #{{ selectedRecette.id }}</p>

        <p><strong>Montant:</strong> {{ selectedRecette.montant }} {{ selectedRecette.devise }}</p>
        <p><strong>Type:</strong> {{ selectedRecette.type_recette }}</p>

        <p>
          <strong>Description:</strong>
          {{ selectedRecette.description || "Aucune description" }}
        </p>

        <p><strong>Status:</strong> {{ selectedRecette.status }}</p>

        <p><strong>Date:</strong> {{ selectedRecette.date_recette }}</p>

        <p>
          <strong>Employé:</strong>
          {{ selectedRecette.employe?.nom || "Non défini" }}
        </p>

        <p><strong>Créé le:</strong> {{ selectedRecette.created_at }}</p>

      </div>

    </div>
  </div>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleImport" />
      <ComponentCard title="Basic Table 1" label_btn="Créer une recette" label_filter_btn="Filtrer"
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
                    <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Type de recette</p>
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
                <tr v-for="(recette, index) in paginatedRecettes" :key="recette.id"
                  class="border-t border-gray-100 dark:border-gray-800">
                  <!-- N° facture -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="font-medium text-gray-800 dark:text-white">
                      #FAC-{{ recette.id }}
                    </p>
                  </td>

                  <!-- Type de recette -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ recette.type_recette }}
                    </p>
                  </td>

                  <!-- Description -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ shortText(recette.description) }}
                    </p>
                  </td>

                  <!-- Montant -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="font-medium text-gray-800 dark:text-white">
                      {{ recette.montant }} {{ recette.devise }}
                    </p>
                  </td>

                  <!-- Status -->
                  <td class="px-5 py-4 sm:px-6">
                    <span :class="[
                      'rounded-full px-2 py-1 text-xs font-medium',
                      {
                        'bg-success-50 text-success-700':
                          recette.status === 'succès',

                        'bg-warning-50 text-warning-700':
                          recette.status === 'en attente',
                        'bg-error-50 text-error-700':
                          recette.status === 'échec',
                      },
                    ]">
                      {{ recette.status }}
                    </span>
                  </td>

                  <!-- Date -->
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">
                      {{ recette.date_recette }}
                    </p>
                  </td>

                  <!-- Actions -->
                  <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                      <button class="text-blue-500 hover:underline border border-blue-500 px-2 py-1 rounded"
                        @click="openDetail(recette)">
                        Voir
                      </button>

                      <button class="text-green-500 hover:underline border border-green-500 px-2 py-1 rounded"
                        @click="editRecette(recette)">
                        Modifier
                      </button>

                      <button class="text-red-500 hover:underline border border-red-500 px-2 py-1 rounded"
                        @click="removeRecette(recette)">
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

import { getAllRecettes, createRecette, updateRecette, deleteRecette } from "@/services/recettesService";

const currentPageTitle = ref("Suivi des recettes");

const recettes = ref([]);
const showModal = ref(false);

const isEditing = ref(false);
const editingId = ref(null);

const form = ref({
  montant: "",
  type_recette: "",
  description: "",
  date_recette: "",
  status: "succès",
});

const fetchRecettes = async () => {
  try {
    const response = await getAllRecettes();

    // IMPORTANT
    recettes.value = response.data;

    console.log(recettes.value);
  } catch (error) {
    console.error("Erreur API :", error);
  }
};

const submitRecette = async () => {
  try {
    if (isEditing.value) {
      await updateRecette(editingId.value, form.value);
      alert("Recette modifiée avec succès");
    } else {
      await createRecette(form.value);
      alert("Recette créée avec succès");
    }
    // recharge les recettes
    await fetchRecettes();
    currentPage.value = 1;

    // reset formulaire
    form.value = {
      montant: "",
      type_recette: "",
      description: "",
      date_recette: "",
      status: "succès",
    };

    // fermer modal
    showModal.value = false;
    isEditing.value = false;
    editingId.value = null;

  } catch (error) {
    console.error(error);
    alert("Erreur création recette");
  }
};

const editRecette = (recette) => {
  isEditing.value = true;
  editingId.value = recette.id;

  form.value = {
    montant: recette.montant,
    devise: recette.devise,
    type_recette: recette.type_recette,
    description: recette.description,
    date_recette: recette.date_recette,
    status: recette.status,
  };

  showModal.value = true;
};

const removeRecette = async (recette) => {
  if (!confirm(`Supprimer la recette #FAC-${recette.id} ?`)) return;

  try {
    await deleteRecette(recette.id);
    await fetchRecettes();
    currentPage.value = 1;

    alert("Recette supprimée avec succès");
  } catch (error) {
    console.error(error);
    alert("Erreur suppression recette");
  }
};

const selectedRecette = ref(null);
const showDetailModal = ref(false);

const openDetail = (recette) => {
  selectedRecette.value = recette;
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

    const recettesToImport = rows.map((row) => ({
      montant: row.montant || row.Montant,
      devise: row.devise || row.Devise || "XOF",
      type_recette: row.type_recette || row["Type recette"] || row.Type,
      description: row.description || row.Description || "",
      date_recette: row.date_recette || row.Date,
      status: row.status || row.Status || "succès",
    }));

    for (const recette of recettesToImport) {
      await createRecette(recette);
    }

    await fetchRecettes();
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
  return Math.ceil(recettes.value.length / perPage.value) || 1;
});

const paginatedRecettes = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;

  return recettes.value.slice(start, end);
});

onMounted(() => {
  fetchRecettes();
  currentPage.value = 1;
});
</script>
