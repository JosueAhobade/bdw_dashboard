<template>
  <!-- MODAL CRÉATION / MODIFICATION -->
  <div v-if="showModal" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ isEditing ? `Modifier la ${config.singular}` : `Nouvelle ${config.singular}` }}
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
      </div>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Montant *</label>
            <input v-model="form.montant" type="number" step="0.01" min="0" :class="inputClass" required />
          </div>
          <div>
            <label :class="labelClass">Devise</label>
            <select v-model="form.devise" :class="inputClass">
              <option v-for="d in DEVISES" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
        </div>

        <div>
          <label :class="labelClass">{{ config.typeLabel }} *</label>
          <input v-model="form[config.typeField]" type="text" :class="inputClass" :placeholder="config.typePlaceholder"
            list="types-list" required />
          <datalist id="types-list">
            <option v-for="t in options.types" :key="t" :value="t" />
          </datalist>
        </div>

        <div>
          <label :class="labelClass">Description</label>
          <textarea v-model="form.description" :class="inputClass"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Date *</label>
            <input v-model="form[config.dateField]" type="date" :class="inputClass" required />
          </div>
          <div>
            <label :class="labelClass">Statut</label>
            <select v-model="form.status" :class="inputClass">
              <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Mode de paiement</label>
            <input v-model="form.mode_paiement" type="text" :class="inputClass" list="modes-list"
              placeholder="espèces, momo, virement..." />
            <datalist id="modes-list">
              <option v-for="m in modesSuggestions" :key="m" :value="m" />
            </datalist>
          </div>
          <div>
            <label :class="labelClass">Référence paiement</label>
            <input v-model="form.reference_paiement" type="text" :class="inputClass" placeholder="n° reçu, transaction..." />
          </div>
        </div>

        <!-- Preuves -->
        <div>
          <label :class="labelClass">Preuves (PDF ou images, 10 Mo max. chacune)</label>

          <ul v-if="isEditing && editingPreuves.length" class="mb-2 space-y-1">
            <li v-for="preuve in editingPreuves" :key="preuve.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
              <span class="truncate text-gray-700 dark:text-gray-300">{{ preuve.original_name }}</span>
              <button type="button" class="ml-2 text-red-500 hover:underline" @click="removePreuve(preuve, true)">
                Retirer
              </button>
            </li>
          </ul>

          <input ref="preuvesInput" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
            :class="inputClass" @change="onPreuvesSelected" />
          <p v-if="newPreuves.length" class="mt-1 text-xs text-gray-500">
            {{ newPreuves.length }} fichier(s) à ajouter
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal" class="border px-4 py-2 rounded-lg dark:border-gray-700 dark:text-gray-300">
            Annuler
          </button>
          <button type="submit" :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {{ saving ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL DÉTAILS -->
  <div v-if="showDetailModal" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Détails {{ config.singular }}</h2>
        <button @click="showDetailModal = false" class="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
      </div>

      <div v-if="selected" class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <p><strong>Réf :</strong> {{ reference(selected) }}</p>
        <p><strong>Montant :</strong> {{ formatMontant(selected.montant) }} {{ selected.devise }}</p>
        <p><strong>{{ config.typeLabel }} :</strong> {{ selected[config.typeField] }}</p>
        <p><strong>Description :</strong> {{ selected.description || "Aucune description" }}</p>
        <p><strong>Statut :</strong> {{ selected.status }}</p>
        <p><strong>Date :</strong> {{ formatDate(selected[config.dateField]) }}</p>
        <p><strong>Mode de paiement :</strong> {{ selected.mode_paiement || "-" }}</p>
        <p><strong>Référence paiement :</strong> {{ selected.reference_paiement || "-" }}</p>
        <p v-if="config.showEmploye"><strong>Employé :</strong> {{ employeName(selected) }}</p>
        <p><strong>Créé le :</strong> {{ formatDateTime(selected.created_at) }}</p>

        <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
          <p class="font-semibold mb-2">Preuves</p>
          <p v-if="loadingDetail" class="text-gray-500">Chargement...</p>
          <p v-else-if="!selected.preuves?.length" class="text-gray-500">Aucune preuve.</p>
          <ul v-else class="space-y-2">
            <li v-for="preuve in selected.preuves" :key="preuve.id"
              class="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ preuve.original_name }}</p>
                <p class="text-xs text-gray-500">{{ formatSize(preuve.size) }}</p>
              </div>
              <div class="flex shrink-0 gap-2">
                <button class="text-blue-500 hover:underline" @click="previewPreuve(preuve)">Voir</button>
                <button class="text-green-600 hover:underline" @click="downloadPreuve(preuve)">Télécharger</button>
                <button v-if="canManageOperations" class="text-red-500 hover:underline"
                  @click="removePreuve(preuve, false)">Supprimer</button>
              </div>
            </li>
          </ul>

          <div v-if="canManageOperations" class="mt-3">
            <input ref="detailPreuvesInput" type="file" multiple class="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" @change="addPreuvesFromDetail" />
            <button class="text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-500/10"
              @click="detailPreuvesInput.click()">
              + Ajouter des preuves
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb :pageTitle="config.title" />
    <div class="space-y-5 sm:space-y-6">
      <input ref="importInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleImport" />

      <ComponentCard :title="config.title">
        <!-- Barre d'outils -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative flex-1 min-w-[220px]">
            <input v-model="search" type="search" :placeholder="`Rechercher (type, description, référence, montant...)`"
              :class="[inputClass, 'pl-9']" />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
          </div>

          <button type="button" :class="btnGray" @click="showFilters = !showFilters">
            Filtres<span v-if="activeFiltersCount"
              class="ml-1.5 rounded-full bg-blue-500 px-1.5 text-xs text-white">{{ activeFiltersCount }}</span>
          </button>

          <div class="relative" v-click-outside="() => (showExportMenu = false)">
            <button type="button" :class="btnGray" :disabled="exporting" @click="showExportMenu = !showExportMenu">
              {{ exporting ? "Export..." : "Exporter ▾" }}
            </button>
            <div v-if="showExportMenu"
              class="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                @click="exportData('xlsx')">Excel (.xlsx)</button>
              <button class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                @click="exportData('csv')">CSV (.csv)</button>
            </div>
          </div>

          <template v-if="canManageOperations">
            <button type="button" class="inline-flex items-center rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
              @click="importInput.click()">
              Importer
            </button>
            <button type="button" class="inline-flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
              @click="openCreate">
              Créer une {{ config.singular }}
            </button>
          </template>
        </div>

        <!-- Filtres avancés -->
        <div v-if="showFilters"
          class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800">
          <div>
            <label :class="labelClass">{{ config.typeLabel }}</label>
            <select v-model="filters.type" :class="inputClass">
              <option value="">Tous</option>
              <option v-for="t in options.types" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Statut</label>
            <select v-model="filters.status" :class="inputClass">
              <option value="">Tous</option>
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Mode de paiement</label>
            <select v-model="filters.mode_paiement" :class="inputClass">
              <option value="">Tous</option>
              <option v-for="m in options.modes_paiement" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Devise</label>
            <select v-model="filters.devise" :class="inputClass">
              <option value="">Toutes</option>
              <option v-for="d in options.devises" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Date du</label>
            <input v-model="filters.date_from" type="date" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Date au</label>
            <input v-model="filters.date_to" type="date" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Montant min.</label>
            <input v-model.lazy="filters.montant_min" type="number" min="0" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Montant max.</label>
            <input v-model.lazy="filters.montant_max" type="number" min="0" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Preuves</label>
            <select v-model="filters.has_preuve" :class="inputClass">
              <option value="">Toutes</option>
              <option value="1">Avec preuve</option>
              <option value="0">Sans preuve</option>
            </select>
          </div>
          <div class="flex items-end">
            <button type="button" :class="btnGray" @click="resetFilters">Réinitialiser</button>
          </div>
        </div>

        <!-- Totaux -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span>{{ pagination.total }} {{ config.plural }}</span>
          <span v-for="t in totals" :key="t.devise">
            Total {{ t.devise }} : <strong class="text-gray-800 dark:text-white/90">{{ formatMontant(t.total) }}</strong>
          </span>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full responsive-table">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th v-for="col in columns" :key="col.key" class="px-5 py-3 text-left sm:px-6 whitespace-nowrap">
                    <button v-if="col.sort" type="button"
                      class="inline-flex items-center gap-1 font-medium text-gray-500 text-theme-xs hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                      @click="toggleSort(col.sort)">
                      {{ col.label }}
                      <span class="text-[10px]">{{ sortIndicator(col.sort) }}</span>
                    </button>
                    <p v-else class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ col.label }}</p>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="loading">
                  <td :colspan="columns.length" class="px-6 py-8 text-center text-gray-500">Chargement...</td>
                </tr>
                <tr v-else-if="!items.length">
                  <td :colspan="columns.length" class="px-6 py-8 text-center text-gray-500">
                    Aucune {{ config.singular }} ne correspond à ces critères.
                  </td>
                </tr>
                <tr v-else v-for="item in items" :key="item.id" class="border-t border-gray-100 dark:border-gray-800">
                  <td class="px-5 py-4 sm:px-6">
                    <p class="font-medium text-gray-800 dark:text-white">{{ reference(item) }}</p>
                  </td>
                  <td v-if="config.showEmploye" class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">{{ employeName(item) }}</p>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400">{{ item[config.typeField] }}</p>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <p class="text-gray-500 dark:text-gray-400" :title="item.description">{{ shortText(item.description) }}</p>
                  </td>
                  <td class="px-5 py-4 sm:px-6 whitespace-nowrap">
                    <p class="font-medium text-gray-800 dark:text-white">{{ formatMontant(item.montant) }} {{ item.devise }}</p>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <span :class="['rounded-full px-2 py-1 text-xs font-medium', statusClass(item.status)]">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4 sm:px-6 whitespace-nowrap">
                    <p class="text-gray-500 dark:text-gray-400">{{ formatDate(item[config.dateField]) }}</p>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <span v-if="item.preuves_count" class="text-sm text-gray-700 dark:text-gray-300" title="Preuves jointes">
                      📎 {{ item.preuves_count }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-5 py-4 sm:px-6">
                    <div class="flex items-center gap-2">
                      <button class="text-blue-500 hover:underline border border-blue-500 px-2 py-1 rounded"
                        @click="openDetail(item)">Voir</button>
                      <template v-if="canManageOperations">
                        <button class="text-green-500 hover:underline border border-green-500 px-2 py-1 rounded"
                          @click="openEdit(item)">Modifier</button>
                        <button class="text-red-500 hover:underline border border-red-500 px-2 py-1 rounded"
                          @click="removeItem(item)">Supprimer</button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>Page {{ pagination.current_page }} sur {{ pagination.last_page }}</span>
                <select v-model.number="perPage" class="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-900">
                  <option v-for="n in [10, 15, 25, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
                </select>
              </div>
              <div class="flex gap-2">
                <button class="border px-3 py-1 rounded disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  :disabled="page <= 1" @click="page--">Précédent</button>
                <button class="border px-3 py-1 rounded disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  :disabled="page >= pagination.last_page" @click="page++">Suivant</button>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import * as XLSX from "xlsx";

import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { errorMessage } from "@/api/axios";
import { useAuth } from "@/composables/useAuth";
import { deletePreuve, downloadPreuve as download, operationsService, previewPreuve as preview } from "@/services/operationsService";

/**
 * config : {
 *   kind: "depenses" | "recettes", title, singular, plural, refPrefix,
 *   typeField, typeLabel, typePlaceholder, dateField, showEmploye
 * }
 */
const props = defineProps({
  config: { type: Object, required: true },
});

const config = props.config;

// Ferme un menu au clic à l'extérieur
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) binding.value(event);
    };
    document.addEventListener("click", el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener("click", el._clickOutside);
  },
};
const service = operationsService(config.kind);
const { canManageOperations } = useAuth();

const DEVISES = ["XOF", "EUR", "USD"];
const STATUSES = [
  { value: "succès", label: "Succès" },
  { value: "en attente", label: "En attente" },
  { value: "échec", label: "Échec" },
];
const DEFAULT_MODES = ["espèces", "mobile money", "virement", "chèque", "carte"];

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400";
const btnGray =
  "inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

const columns = computed(() => [
  { key: "ref", label: "Réf.", sort: "id" },
  ...(config.showEmploye ? [{ key: "employe", label: "Fournisseur" }] : []),
  { key: "type", label: config.typeLabel, sort: "type" },
  { key: "description", label: "Description" },
  { key: "montant", label: "Montant", sort: "montant" },
  { key: "status", label: "Statut", sort: "status" },
  { key: "date", label: "Date", sort: "date" },
  { key: "preuves", label: "Preuves" },
  { key: "actions", label: "Actions" },
]);

// ---------- Liste, filtres, tri, pagination ----------
const items = ref([]);
const totals = ref([]);
const loading = ref(false);
const pagination = reactive({ current_page: 1, last_page: 1, total: 0 });
const options = ref({ types: [], status: [], devises: [], modes_paiement: [] });

const search = ref("");
const showFilters = ref(false);
const emptyFilters = () => ({
  type: "",
  status: "",
  mode_paiement: "",
  devise: "",
  date_from: "",
  date_to: "",
  montant_min: "",
  montant_max: "",
  has_preuve: "",
});
const filters = reactive(emptyFilters());
const sort = ref("date");
const direction = ref("desc");
const page = ref(1);
const perPage = ref(15);

const statusOptions = computed(() => [...new Set([...STATUSES.map((s) => s.value), ...options.value.status])]);
const modesSuggestions = computed(() => [...new Set([...DEFAULT_MODES, ...options.value.modes_paiement])]);
const activeFiltersCount = computed(() => Object.values(filters).filter((v) => v !== "" && v !== null).length);

const queryParams = () => {
  const params = { sort: sort.value, direction: direction.value };
  if (search.value.trim()) params.search = search.value.trim();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value !== null) params[key] = value;
  }
  return params;
};

const fetchItems = async () => {
  loading.value = true;
  try {
    const data = await service.list({ ...queryParams(), page: page.value, per_page: perPage.value });
    items.value = data.data;
    totals.value = data.totals || [];
    pagination.current_page = data.current_page;
    pagination.last_page = data.last_page || 1;
    pagination.total = data.total;
    if (page.value > pagination.last_page) page.value = pagination.last_page;
  } catch (error) {
    alert(errorMessage(error, "Erreur de chargement."));
  } finally {
    loading.value = false;
  }
};

const fetchOptions = async () => {
  try {
    options.value = await service.options();
  } catch {
    // les filtres restent utilisables en saisie libre
  }
};

const refresh = () => Promise.all([fetchItems(), fetchOptions()]);

// Recherche : on attend la fin de la frappe
let searchTimer = null;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value === 1 ? fetchItems() : (page.value = 1);
  }, 350);
});

watch([filters, sort, direction, perPage], () => {
  page.value === 1 ? fetchItems() : (page.value = 1);
});
watch(page, fetchItems);

const resetFilters = () => Object.assign(filters, emptyFilters());

const toggleSort = (column) => {
  if (sort.value === column) {
    direction.value = direction.value === "asc" ? "desc" : "asc";
  } else {
    sort.value = column;
    direction.value = column === "type" || column === "status" ? "asc" : "desc";
  }
};
const sortIndicator = (column) => (sort.value !== column ? "↕" : direction.value === "asc" ? "▲" : "▼");

// ---------- Formatage ----------
const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const formatMontant = (value) => numberFormat.format(Number(value || 0));
const formatDate = (value) => (value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("fr-FR") : "-");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString("fr-FR") : "-");
const formatSize = (bytes) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
const reference = (item) => `${config.refPrefix}${item.id}`;
const employeName = (item) => (item.employe ? `${item.employe.nom ?? ""} ${item.employe.prenom ?? ""}`.trim() : "Non défini");
const shortText = (text, max = 30) => (!text ? "-" : text.length > max ? text.slice(0, max) + "..." : text);
const statusClass = (status) =>
  ({
    succès: "bg-success-50 text-success-700",
    "en attente": "bg-warning-50 text-warning-700",
    échec: "bg-error-50 text-error-700",
  })[status] || "bg-gray-100 text-gray-700";

// ---------- Création / modification ----------
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const editingPreuves = ref([]);
const saving = ref(false);
const preuvesInput = ref(null);
const newPreuves = ref([]);

const emptyForm = () => ({
  montant: "",
  devise: "XOF",
  [config.typeField]: "",
  description: "",
  [config.dateField]: new Date().toISOString().slice(0, 10),
  status: "succès",
  mode_paiement: "",
  reference_paiement: "",
});
const form = ref(emptyForm());

const openCreate = () => {
  isEditing.value = false;
  editingId.value = null;
  editingPreuves.value = [];
  newPreuves.value = [];
  form.value = emptyForm();
  showModal.value = true;
};

const openEdit = async (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  newPreuves.value = [];
  editingPreuves.value = [];
  form.value = {
    montant: item.montant,
    devise: item.devise,
    [config.typeField]: item[config.typeField],
    description: item.description,
    [config.dateField]: item[config.dateField] ? String(item[config.dateField]).slice(0, 10) : "",
    status: item.status,
    mode_paiement: item.mode_paiement || "",
    reference_paiement: item.reference_paiement || "",
  };
  showModal.value = true;
  if (item.preuves_count) {
    editingPreuves.value = (await service.get(item.id)).preuves || [];
  }
};

const closeModal = () => {
  showModal.value = false;
  newPreuves.value = [];
  if (preuvesInput.value) preuvesInput.value.value = "";
};

const onPreuvesSelected = (event) => {
  newPreuves.value = Array.from(event.target.files || []);
};

const submitForm = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    const result = isEditing.value
      ? await service.update(editingId.value, payload)
      : await service.create(payload);

    if (newPreuves.value.length) {
      try {
        await service.uploadPreuves(result.data.id, newPreuves.value);
      } catch (error) {
        alert(`${config.singular[0].toUpperCase() + config.singular.slice(1)} enregistrée, mais l'envoi des preuves a échoué :\n${errorMessage(error)}`);
      }
    }

    closeModal();
    await refresh();
  } catch (error) {
    alert(errorMessage(error, "Erreur lors de l'enregistrement."));
  } finally {
    saving.value = false;
  }
};

const removeItem = async (item) => {
  if (!confirm(`Supprimer la ${config.singular} ${reference(item)} et ses preuves ?`)) return;
  try {
    await service.remove(item.id);
    await refresh();
  } catch (error) {
    alert(errorMessage(error, "Erreur lors de la suppression."));
  }
};

// ---------- Détails & preuves ----------
const selected = ref(null);
const showDetailModal = ref(false);
const loadingDetail = ref(false);
const detailPreuvesInput = ref(null);

const openDetail = async (item) => {
  selected.value = { ...item, preuves: [] };
  showDetailModal.value = true;
  loadingDetail.value = true;
  try {
    selected.value = await service.get(item.id);
  } catch (error) {
    alert(errorMessage(error));
  } finally {
    loadingDetail.value = false;
  }
};

const downloadPreuve = async (preuve) => {
  try {
    await download(preuve);
  } catch (error) {
    alert(errorMessage(error, "Téléchargement impossible."));
  }
};

const previewPreuve = async (preuve) => {
  try {
    await preview(preuve);
  } catch (error) {
    alert(errorMessage(error, "Aperçu impossible."));
  }
};

const removePreuve = async (preuve, fromEditModal) => {
  if (!confirm(`Supprimer la preuve « ${preuve.original_name} » ?`)) return;
  try {
    await deletePreuve(preuve.id);
    if (fromEditModal) {
      editingPreuves.value = editingPreuves.value.filter((p) => p.id !== preuve.id);
    } else if (selected.value) {
      selected.value.preuves = selected.value.preuves.filter((p) => p.id !== preuve.id);
    }
    fetchItems();
  } catch (error) {
    alert(errorMessage(error));
  }
};

const addPreuvesFromDetail = async (event) => {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length || !selected.value) return;
  try {
    await service.uploadPreuves(selected.value.id, files);
    selected.value = await service.get(selected.value.id);
    fetchItems();
  } catch (error) {
    alert(errorMessage(error, "Envoi des preuves impossible."));
  }
};

// ---------- Export Excel / CSV (lignes filtrées et triées) ----------
const showExportMenu = ref(false);
const exporting = ref(false);

const exportData = async (format) => {
  showExportMenu.value = false;
  exporting.value = true;
  try {
    const rows = await service.exportAll(queryParams());
    if (!rows.length) {
      alert("Aucune ligne à exporter avec ces filtres.");
      return;
    }

    const sheetRows = rows.map((item) => ({
      "Réf.": reference(item),
      ...(config.showEmploye ? { Fournisseur: employeName(item) } : {}),
      [config.typeLabel]: item[config.typeField],
      Description: item.description || "",
      Montant: Number(item.montant),
      Devise: item.devise,
      Statut: item.status,
      Date: item[config.dateField] ? String(item[config.dateField]).slice(0, 10) : "",
      "Mode de paiement": item.mode_paiement || "",
      "Référence paiement": item.reference_paiement || "",
      Preuves: item.preuves_count || 0,
    }));

    const sheet = XLSX.utils.json_to_sheet(sheetRows);
    const filename = `${config.kind}_${new Date().toISOString().slice(0, 10)}`;

    if (format === "xlsx") {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, config.title.slice(0, 31));
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } else {
      // Séparateur ";" + BOM UTF-8 : s'ouvre correctement dans Excel en français
      const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ";" });
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch (error) {
    alert(errorMessage(error, "Export impossible."));
  } finally {
    exporting.value = false;
  }
};

// ---------- Import (admins) ----------
const importInput = ref(null);

const handleImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const workbook = XLSX.read(await file.arrayBuffer());
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    let created = 0;
    const errors = [];
    for (const [index, row] of rows.entries()) {
      try {
        await service.create({
          montant: row.montant ?? row.Montant,
          devise: row.devise || row.Devise || "XOF",
          [config.typeField]: row[config.typeField] || row[config.typeLabel] || row.Type,
          description: row.description || row.Description || "",
          [config.dateField]: row[config.dateField] || row.Date,
          status: row.status || row.Status || row.Statut || "succès",
          mode_paiement: row.mode_paiement || row["Mode de paiement"] || null,
          reference_paiement: row.reference_paiement || row["Référence paiement"] || null,
        });
        created++;
      } catch (error) {
        errors.push(`Ligne ${index + 2} : ${errorMessage(error)}`);
      }
    }

    await refresh();
    alert(`${created} ligne(s) importée(s).` + (errors.length ? `\n\nErreurs :\n${errors.slice(0, 10).join("\n")}` : ""));
  } catch (error) {
    console.error(error);
    alert("Fichier illisible.");
  } finally {
    event.target.value = "";
  }
};

onMounted(refresh);
</script>
