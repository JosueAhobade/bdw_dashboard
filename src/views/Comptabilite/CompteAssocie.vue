<template>
  <!-- MODAL MOUVEMENT -->
  <div v-if="showModal" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ editingId ? "Modifier le mouvement" : "Nouveau mouvement" }}
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label :class="labelClass">Type *</label>
          <div class="grid grid-cols-2 gap-2">
            <label v-for="t in MOUVEMENT_TYPES" :key="t.value"
              :class="['flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                form.type === t.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-300 dark:border-gray-700',
                'dark:text-gray-300']">
              <input v-model="form.type" type="radio" :value="t.value" class="sr-only" />
              <span :class="t.sens === 'credit' ? 'text-success-600' : 'text-error-600'">{{ t.sens === "credit" ? "+" : "−" }}</span>
              {{ t.label }}
            </label>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Montant ({{ associe?.devise }}) *</label>
            <input v-model="form.montant" type="number" step="0.01" min="0.01" :class="inputClass" required />
          </div>
          <div>
            <label :class="labelClass">Date *</label>
            <input v-model="form.date_mouvement" type="date" :class="inputClass" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Mode de paiement</label>
            <input v-model="form.mode_paiement" type="text" :class="inputClass" list="modes-associes"
              placeholder="virement, espèces..." />
            <datalist id="modes-associes">
              <option v-for="m in ['espèces', 'mobile money', 'virement', 'chèque']" :key="m" :value="m" />
            </datalist>
          </div>
          <div>
            <label :class="labelClass">Référence</label>
            <input v-model="form.reference_paiement" type="text" :class="inputClass" placeholder="n° reçu, virement..." />
          </div>
        </div>
        <div>
          <label :class="labelClass">Description</label>
          <textarea v-model="form.description" :class="inputClass"></textarea>
        </div>
        <div>
          <label :class="labelClass">Preuves (PDF ou images, 10 Mo max. chacune)</label>
          <input ref="preuvesInput" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
            :class="inputClass" @change="(e) => (newPreuves = Array.from(e.target.files || []))" />
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeModal"
            class="border px-4 py-2 rounded-lg dark:border-gray-700 dark:text-gray-300">Annuler</button>
          <button type="submit" :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {{ saving ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL DÉTAIL MOUVEMENT -->
  <div v-if="selected" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">{{ mouvementLabel(selected.type) }}</h2>
        <button @click="selected = null" class="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
      </div>
      <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        <p><strong>Montant :</strong> {{ formatMontant(selected.montant) }} {{ associe?.devise }}</p>
        <p><strong>Date :</strong> {{ formatDate(selected.date_mouvement) }}</p>
        <p><strong>Mode de paiement :</strong> {{ selected.mode_paiement || "-" }}</p>
        <p><strong>Référence :</strong> {{ selected.reference_paiement || "-" }}</p>
        <p><strong>Description :</strong> {{ selected.description || "-" }}</p>
        <p><strong>Saisi par :</strong> {{ selected.creator?.username || "-" }} le {{ formatDateTime(selected.created_at) }}</p>

        <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
          <p class="font-semibold mb-2">Preuves</p>
          <p v-if="!selected.preuves?.length" class="text-gray-500">Aucune preuve.</p>
          <ul v-else class="space-y-2">
            <li v-for="preuve in selected.preuves" :key="preuve.id"
              class="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
              <div class="min-w-0">
                <p class="truncate font-medium">{{ preuve.original_name }}</p>
                <p class="text-xs text-gray-500">{{ formatSize(preuve.size) }}</p>
              </div>
              <div class="flex shrink-0 gap-2">
                <button class="text-blue-500 hover:underline" @click="run(() => previewPreuve(preuve))">Voir</button>
                <button class="text-green-600 hover:underline" @click="run(() => downloadPreuve(preuve))">Télécharger</button>
                <button v-if="canManageOperations" class="text-red-500 hover:underline" @click="removePreuve(preuve)">Supprimer</button>
              </div>
            </li>
          </ul>
          <div v-if="canManageOperations" class="mt-3">
            <input ref="detailPreuvesInput" type="file" multiple class="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" @change="addPreuves" />
            <button class="text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded"
              @click="detailPreuvesInput.click()">+ Ajouter des preuves</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb :pageTitle="associe ? `Compte de ${associe.nom} ${associe.prenom}` : 'Compte d\'associé'" />

    <div class="mb-4">
      <router-link to="/comptes-associes" class="text-sm text-blue-500 hover:underline">← Tous les associés</router-link>
    </div>

    <div v-if="associe" class="space-y-5 sm:space-y-6">
      <!-- Synthèse -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div v-for="kpi in kpis" :key="kpi.label"
          class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ kpi.label }}</p>
          <p :class="['mt-1 text-lg font-semibold', kpi.color]">{{ formatMontant(kpi.value) }} {{ associe.devise }}</p>
          <p v-if="kpi.count != null" class="text-xs text-gray-400">{{ kpi.count }} mouvement(s)</p>
        </div>
      </div>

      <!-- Fiche -->
      <ComponentCard title="Fiche de l'associé">
        <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div v-for="item in fiche" :key="item.label">
            <dt class="text-gray-500 dark:text-gray-400">{{ item.label }}</dt>
            <dd class="font-medium text-gray-800 dark:text-white/90">{{ item.value || "-" }}</dd>
          </div>
        </dl>
        <p v-if="associe.notes" class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ associe.notes }}</p>
      </ComponentCard>

      <!-- Relevé -->
      <ComponentCard title="Relevé du compte">
        <div class="flex flex-wrap items-center gap-2">
          <input v-model="search" type="search" placeholder="Rechercher (description, référence, montant...)"
            :class="[inputClass, 'flex-1 min-w-[220px]']" />
          <button type="button" :class="btnGray" @click="showFilters = !showFilters">
            Filtres<span v-if="activeFiltersCount" class="ml-1.5 rounded-full bg-blue-500 px-1.5 text-xs text-white">{{ activeFiltersCount }}</span>
          </button>
          <button type="button" :class="btnGray" :disabled="exporting" @click="exportReleve('xlsx')">Exporter Excel</button>
          <button type="button" :class="btnGray" :disabled="exporting" @click="exportReleve('csv')">Exporter CSV</button>
          <button v-if="canManageOperations" type="button"
            class="inline-flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
            @click="openCreate">
            Nouveau mouvement
          </button>
        </div>

        <div v-if="showFilters"
          class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800">
          <div>
            <label :class="labelClass">Type</label>
            <select v-model="filters.type" :class="inputClass">
              <option value="">Tous</option>
              <option v-for="t in MOUVEMENT_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Sens</label>
            <select v-model="filters.sens" :class="inputClass">
              <option value="">Tous</option>
              <option value="credit">Crédit (apports, intérêts)</option>
              <option value="debit">Débit (remboursements, retraits)</option>
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
            <button type="button" :class="btnGray" @click="Object.assign(filters, emptyFilters())">Réinitialiser</button>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th v-for="col in columns" :key="col.key"
                    :class="['px-5 py-3 sm:px-6 whitespace-nowrap', col.right ? 'text-right' : 'text-left']">
                    <button v-if="col.sort" type="button"
                      class="inline-flex items-center gap-1 font-medium text-gray-500 text-theme-xs hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                      @click="toggleSort(col.sort)">
                      {{ col.label }} <span class="text-[10px]">{{ sortIndicator(col.sort) }}</span>
                    </button>
                    <p v-else class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ col.label }}</p>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="loading">
                  <td :colspan="columns.length" class="px-6 py-8 text-center text-gray-500">Chargement...</td>
                </tr>
                <tr v-else-if="!mouvements.length">
                  <td :colspan="columns.length" class="px-6 py-8 text-center text-gray-500">Aucun mouvement.</td>
                </tr>
                <tr v-else v-for="m in mouvements" :key="m.id">
                  <td class="px-5 py-3 sm:px-6 whitespace-nowrap text-gray-600 dark:text-gray-400">{{ formatDate(m.date_mouvement) }}</td>
                  <td class="px-5 py-3 sm:px-6">
                    <span :class="['rounded-full px-2 py-1 text-xs font-medium',
                      m.sens === 'credit' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700']">
                      {{ mouvementLabel(m.type) }}
                    </span>
                  </td>
                  <td class="px-5 py-3 sm:px-6 text-gray-600 dark:text-gray-400" :title="m.description">
                    {{ shortText(m.description || m.reference_paiement) }}
                  </td>
                  <td class="px-5 py-3 sm:px-6 text-right whitespace-nowrap text-success-600">
                    {{ m.sens === "credit" ? formatMontant(m.montant) : "" }}
                  </td>
                  <td class="px-5 py-3 sm:px-6 text-right whitespace-nowrap text-error-600">
                    {{ m.sens === "debit" ? formatMontant(m.montant) : "" }}
                  </td>
                  <td class="px-5 py-3 sm:px-6 text-right whitespace-nowrap font-semibold text-gray-800 dark:text-white">
                    {{ formatMontant(m.solde_apres) }}
                  </td>
                  <td class="px-5 py-3 sm:px-6 text-gray-600 dark:text-gray-300">
                    {{ m.preuves_count ? `📎 ${m.preuves_count}` : "-" }}
                  </td>
                  <td class="px-5 py-3 sm:px-6">
                    <div class="flex items-center gap-2">
                      <button class="text-blue-500 hover:underline border border-blue-500 px-2 py-1 rounded"
                        @click="openDetail(m)">Voir</button>
                      <template v-if="canManageOperations">
                        <button class="text-green-500 hover:underline border border-green-500 px-2 py-1 rounded"
                          @click="openEdit(m)">Modifier</button>
                        <button class="text-red-500 hover:underline border border-red-500 px-2 py-1 rounded"
                          @click="remove(m)">Supprimer</button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>{{ pagination.total }} mouvement(s) · Page {{ pagination.current_page }} sur {{ pagination.last_page }}</span>
                <select v-model.number="perPage" class="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-900">
                  <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
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
    <p v-else-if="notFound" class="text-gray-500">Associé introuvable.</p>
    <p v-else class="text-gray-500">Chargement...</p>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { errorMessage } from "@/api/axios";
import { useAuth } from "@/composables/useAuth";
import {
  MOUVEMENT_TYPES,
  createMouvement,
  deleteMouvement,
  exportMouvements,
  getAssocie,
  getMouvement,
  getMouvements,
  mouvementLabel,
  updateMouvement,
  uploadMouvementPreuves,
} from "@/services/associesService";
import { deletePreuve, downloadPreuve, previewPreuve } from "@/services/operationsService";
import { formatDate, formatDateTime, formatMontant, formatSize } from "@/utils/format";
import { exportRows, today } from "@/utils/exportSheet";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400";
const btnGray =
  "inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

const route = useRoute();
const associeId = route.params.id;
const { canManageOperations } = useAuth();

const columns = [
  { key: "date", label: "Date", sort: "date" },
  { key: "type", label: "Type", sort: "type" },
  { key: "libelle", label: "Libellé" },
  { key: "credit", label: "Crédit", right: true },
  { key: "debit", label: "Débit", right: true },
  { key: "solde", label: "Solde cumulé", right: true },
  { key: "preuves", label: "Preuves" },
  { key: "actions", label: "Actions" },
];

const shortText = (text, max = 40) => (!text ? "-" : text.length > max ? text.slice(0, max) + "..." : text);
const run = async (fn) => {
  try {
    await fn();
  } catch (error) {
    alert(errorMessage(error));
  }
};

// ---------- Associé ----------
const associe = ref(null);
const notFound = ref(false);

const fetchAssocie = async () => {
  try {
    associe.value = await getAssocie(associeId);
  } catch (error) {
    if (error?.response?.status === 404) notFound.value = true;
    else alert(errorMessage(error));
  }
};

const kpis = computed(() => {
  const s = associe.value?.synthese || {};
  return [
    { label: "Apports", value: s.apport?.total, count: s.apport?.count, color: "text-success-600" },
    { label: "Intérêts", value: s.interets?.total, count: s.interets?.count, color: "text-success-600" },
    { label: "Remboursements", value: s.remboursement?.total, count: s.remboursement?.count, color: "text-error-600" },
    { label: "Retraits", value: s.retrait?.total, count: s.retrait?.count, color: "text-error-600" },
    { label: "Solde dû à l'associé", value: associe.value?.solde, count: null, color: "text-gray-800 dark:text-white/90" },
  ];
});

const fiche = computed(() => {
  const a = associe.value;
  return [
    { label: "Fonction", value: a.fonction },
    { label: "Part du capital", value: a.part != null ? `${formatMontant(a.part)} %` : "" },
    { label: "Date d'adhésion", value: a.date_adhesion ? formatDate(a.date_adhesion) : "" },
    { label: "Email", value: a.email },
    { label: "Téléphone", value: a.telephone },
    { label: "Adresse", value: a.adresse },
  ];
});

// ---------- Relevé ----------
const mouvements = ref([]);
const loading = ref(false);
const pagination = reactive({ current_page: 1, last_page: 1, total: 0 });
const search = ref("");
const showFilters = ref(false);
const emptyFilters = () => ({ type: "", sens: "", date_from: "", date_to: "", montant_min: "", montant_max: "", has_preuve: "" });
const filters = reactive(emptyFilters());
const sort = ref("date");
const direction = ref("desc");
const page = ref(1);
const perPage = ref(25);

const activeFiltersCount = computed(() => Object.values(filters).filter((v) => v !== "").length);

const queryParams = () => {
  const params = { sort: sort.value, direction: direction.value };
  if (search.value.trim()) params.search = search.value.trim();
  for (const [key, value] of Object.entries(filters)) if (value !== "") params[key] = value;
  return params;
};

const fetchMouvements = async () => {
  loading.value = true;
  try {
    const data = await getMouvements(associeId, { ...queryParams(), page: page.value, per_page: perPage.value });
    mouvements.value = data.data;
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

const refresh = () => Promise.all([fetchAssocie(), fetchMouvements()]);

let searchTimer = null;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => (page.value === 1 ? fetchMouvements() : (page.value = 1)), 350);
});
watch([filters, sort, direction, perPage], () => (page.value === 1 ? fetchMouvements() : (page.value = 1)));
watch(page, fetchMouvements);

const toggleSort = (column) => {
  if (sort.value === column) direction.value = direction.value === "asc" ? "desc" : "asc";
  else {
    sort.value = column;
    direction.value = column === "type" ? "asc" : "desc";
  }
};
const sortIndicator = (column) => (sort.value !== column ? "↕" : direction.value === "asc" ? "▲" : "▼");

// ---------- Saisie ----------
const showModal = ref(false);
const saving = ref(false);
const editingId = ref(null);
const preuvesInput = ref(null);
const newPreuves = ref([]);
const emptyForm = () => ({
  type: "apport",
  montant: "",
  date_mouvement: today(),
  mode_paiement: "",
  reference_paiement: "",
  description: "",
});
const form = ref(emptyForm());

const openCreate = () => {
  editingId.value = null;
  form.value = emptyForm();
  newPreuves.value = [];
  showModal.value = true;
};

const openEdit = (m) => {
  editingId.value = m.id;
  form.value = Object.fromEntries(Object.keys(emptyForm()).map((key) => [key, m[key] ?? ""]));
  newPreuves.value = [];
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  newPreuves.value = [];
  if (preuvesInput.value) preuvesInput.value.value = "";
};

const submit = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    const result = editingId.value
      ? await updateMouvement(editingId.value, payload)
      : await createMouvement(associeId, payload);

    if (newPreuves.value.length) {
      try {
        await uploadMouvementPreuves(result.data.id, newPreuves.value);
      } catch (error) {
        alert(`Mouvement enregistré, mais l'envoi des preuves a échoué :\n${errorMessage(error)}`);
      }
    }
    closeModal();
    await refresh();
  } catch (error) {
    alert(errorMessage(error, "Enregistrement impossible."));
  } finally {
    saving.value = false;
  }
};

const remove = async (m) => {
  if (!confirm(`Supprimer ce mouvement (${mouvementLabel(m.type)} de ${formatMontant(m.montant)} ${associe.value.devise}) et ses preuves ?`)) return;
  try {
    await deleteMouvement(m.id);
    await refresh();
  } catch (error) {
    alert(errorMessage(error));
  }
};

// ---------- Détail & preuves ----------
const selected = ref(null);
const detailPreuvesInput = ref(null);

const openDetail = async (m) => {
  try {
    selected.value = await getMouvement(m.id);
  } catch (error) {
    alert(errorMessage(error));
  }
};

const removePreuve = async (preuve) => {
  if (!confirm(`Supprimer la preuve « ${preuve.original_name} » ?`)) return;
  try {
    await deletePreuve(preuve.id);
    selected.value.preuves = selected.value.preuves.filter((p) => p.id !== preuve.id);
    fetchMouvements();
  } catch (error) {
    alert(errorMessage(error));
  }
};

const addPreuves = async (event) => {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) return;
  try {
    await uploadMouvementPreuves(selected.value.id, files);
    selected.value = await getMouvement(selected.value.id);
    fetchMouvements();
  } catch (error) {
    alert(errorMessage(error, "Envoi des preuves impossible."));
  }
};

// ---------- Export du relevé ----------
const exporting = ref(false);

const exportReleve = async (format) => {
  exporting.value = true;
  try {
    // Relevé dans l'ordre chronologique, avec les filtres en cours
    const rows = await exportMouvements(associeId, { ...queryParams(), sort: "date", direction: "asc" });
    if (!rows.length) {
      alert("Aucun mouvement à exporter avec ces filtres.");
      return;
    }
    const a = associe.value;
    const sheetRows = rows.map((m) => ({
      Date: String(m.date_mouvement).slice(0, 10),
      Type: mouvementLabel(m.type),
      Description: m.description || "",
      "Mode de paiement": m.mode_paiement || "",
      Référence: m.reference_paiement || "",
      Crédit: m.sens === "credit" ? Number(m.montant) : "",
      Débit: m.sens === "debit" ? Number(m.montant) : "",
      "Solde cumulé": Number(m.solde_apres),
      Devise: a.devise,
      Preuves: m.preuves_count || 0,
    }));
    const slug = `${a.nom}_${a.prenom}`.normalize("NFD").replace(/[^\w]+/g, "_");
    exportRows(sheetRows, `releve_associe_${slug}_${today()}`, format, "Relevé");
  } catch (error) {
    alert(errorMessage(error, "Export impossible."));
  } finally {
    exporting.value = false;
  }
};

onMounted(refresh);
</script>
