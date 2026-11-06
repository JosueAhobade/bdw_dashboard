<template>
  <!-- MODAL ASSOCIÉ -->
  <div v-if="showModal" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ editing ? "Modifier l'associé" : "Nouvel associé" }}
        </h2>
        <button @click="showModal = false" class="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Nom *</label>
            <input v-model="form.nom" type="text" :class="inputClass" required />
          </div>
          <div>
            <label :class="labelClass">Prénom *</label>
            <input v-model="form.prenom" type="text" :class="inputClass" required />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Email</label>
            <input v-model="form.email" type="email" :class="inputClass" />
          </div>
          <div>
            <label :class="labelClass">Téléphone</label>
            <input v-model="form.telephone" type="text" :class="inputClass" />
          </div>
        </div>
        <div>
          <label :class="labelClass">Adresse</label>
          <input v-model="form.adresse" type="text" :class="inputClass" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Fonction</label>
            <input v-model="form.fonction" type="text" :class="inputClass" placeholder="gérant, associé..." />
          </div>
          <div>
            <label :class="labelClass">Part du capital (%)</label>
            <input v-model="form.part" type="number" step="0.01" min="0" max="100" :class="inputClass" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :class="labelClass">Devise du compte</label>
            <select v-model="form.devise" :class="inputClass" :disabled="editing && editing.mouvements_count > 0">
              <option v-for="d in ['XOF', 'EUR', 'USD']" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label :class="labelClass">Date d'adhésion</label>
            <input v-model="form.date_adhesion" type="date" :class="inputClass" />
          </div>
        </div>
        <div>
          <label :class="labelClass">Notes</label>
          <textarea v-model="form.notes" :class="inputClass"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="showModal = false"
            class="border px-4 py-2 rounded-lg dark:border-gray-700 dark:text-gray-300">Annuler</button>
          <button type="submit" :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {{ saving ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb pageTitle="Comptes d'associés" />
    <div class="space-y-5 sm:space-y-6">
      <!-- Synthèse -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div v-for="kpi in kpis" :key="kpi.label"
          class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ kpi.label }}</p>
          <p v-for="v in kpi.values" :key="v.devise" :class="['mt-1 text-xl font-semibold', kpi.color]">
            {{ formatMontant(v.value) }} {{ v.devise }}
          </p>
          <p v-if="!kpi.values.length" class="mt-1 text-xl font-semibold text-gray-400">-</p>
          <p class="mt-1 text-xs text-gray-400">{{ kpi.hint }}</p>
        </div>
      </div>

      <ComponentCard title="Associés" desc="Solde = apports + intérêts - remboursements - retraits (montant dû par la société à l'associé).">
        <div class="flex flex-wrap items-center gap-2">
          <input v-model="search" type="search" placeholder="Rechercher (nom, email, téléphone, fonction)"
            :class="[inputClass, 'flex-1 min-w-[220px]']" />
          <button type="button" :class="btnGray" @click="exportList('xlsx')">Exporter Excel</button>
          <button type="button" :class="btnGray" @click="exportList('csv')">Exporter CSV</button>
          <button v-if="canManageOperations" type="button"
            class="inline-flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
            @click="openCreate">
            Ajouter un associé
          </button>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="max-w-full overflow-x-auto custom-scrollbar">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th v-for="col in columns" :key="col.key" class="px-5 py-3 text-left sm:px-6 whitespace-nowrap">
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
                <tr v-else-if="!associes.length">
                  <td :colspan="columns.length" class="px-6 py-8 text-center text-gray-500">
                    {{ search ? "Aucun associé ne correspond à la recherche." : "Aucun associé pour le moment." }}
                  </td>
                </tr>
                <tr v-else v-for="a in associes" :key="a.id"
                  class="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]" @click="openAccount(a)">
                  <td class="px-5 py-4 sm:px-6">
                    <p class="font-medium text-gray-800 dark:text-white">{{ a.nom }} {{ a.prenom }}</p>
                    <p class="text-xs text-gray-500">{{ a.fonction || a.email || "" }}</p>
                  </td>
                  <td class="px-5 py-4 sm:px-6 text-gray-500 dark:text-gray-400">{{ a.part != null ? `${formatMontant(a.part)} %` : "-" }}</td>
                  <td class="px-5 py-4 sm:px-6 whitespace-nowrap text-success-600">{{ formatMontant(a.total_credits) }} {{ a.devise }}</td>
                  <td class="px-5 py-4 sm:px-6 whitespace-nowrap text-error-600">{{ formatMontant(a.total_debits) }} {{ a.devise }}</td>
                  <td class="px-5 py-4 sm:px-6 whitespace-nowrap font-semibold text-gray-800 dark:text-white">
                    {{ formatMontant(a.solde) }} {{ a.devise }}
                  </td>
                  <td class="px-5 py-4 sm:px-6 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {{ formatDate(a.dernier_mouvement) }}
                  </td>
                  <td class="px-5 py-4 sm:px-6" @click.stop>
                    <div class="flex items-center gap-2">
                      <button class="text-blue-500 hover:underline border border-blue-500 px-2 py-1 rounded"
                        @click="openAccount(a)">Compte</button>
                      <template v-if="canManageOperations">
                        <button class="text-green-500 hover:underline border border-green-500 px-2 py-1 rounded"
                          @click="openEdit(a)">Modifier</button>
                        <button class="text-red-500 hover:underline border border-red-500 px-2 py-1 rounded"
                          @click="remove(a)">Supprimer</button>
                      </template>
                    </div>
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
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { errorMessage } from "@/api/axios";
import { useAuth } from "@/composables/useAuth";
import { createAssocie, deleteAssocie, getAssocies, updateAssocie } from "@/services/associesService";
import { formatDate, formatMontant } from "@/utils/format";
import { exportRows, today } from "@/utils/exportSheet";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400";
const btnGray =
  "inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700";

const router = useRouter();
const { canManageOperations } = useAuth();

const columns = [
  { key: "nom", label: "Associé", sort: "nom" },
  { key: "part", label: "Part", sort: "part" },
  { key: "credits", label: "Apports + intérêts", sort: "total_credits" },
  { key: "debits", label: "Remboursements + retraits", sort: "total_debits" },
  { key: "solde", label: "Solde", sort: "solde" },
  { key: "dernier", label: "Dernier mouvement", sort: "dernier_mouvement" },
  { key: "actions", label: "Actions" },
];

const associes = ref([]);
const totals = ref([]);
const loading = ref(false);
const search = ref("");
const sort = ref("nom");
const direction = ref("asc");

const kpis = computed(() => [
  {
    label: "Total apporté",
    hint: "Apports et intérêts crédités",
    color: "text-success-600",
    values: totals.value.map((t) => ({ devise: t.devise, value: t.total_credits })),
  },
  {
    label: "Total remboursé",
    hint: "Remboursements et retraits",
    color: "text-error-600",
    values: totals.value.map((t) => ({ devise: t.devise, value: t.total_debits })),
  },
  {
    label: "Solde dû aux associés",
    hint: `${associes.value.length} associé(s)`,
    color: "text-gray-800 dark:text-white/90",
    values: totals.value.map((t) => ({ devise: t.devise, value: t.solde })),
  },
]);

const fetchAssocies = async () => {
  loading.value = true;
  try {
    const params = { sort: sort.value, direction: direction.value };
    if (search.value.trim()) params.search = search.value.trim();
    const data = await getAssocies(params);
    associes.value = data.data;
    totals.value = data.totals;
  } catch (error) {
    alert(errorMessage(error, "Erreur de chargement."));
  } finally {
    loading.value = false;
  }
};

let searchTimer = null;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchAssocies, 350);
});
watch([sort, direction], fetchAssocies);

const toggleSort = (column) => {
  if (sort.value === column) {
    direction.value = direction.value === "asc" ? "desc" : "asc";
  } else {
    sort.value = column;
    direction.value = column === "nom" ? "asc" : "desc";
  }
};
const sortIndicator = (column) => (sort.value !== column ? "↕" : direction.value === "asc" ? "▲" : "▼");

const openAccount = (a) => router.push(`/comptes-associes/${a.id}`);

// ---------- Création / modification ----------
const showModal = ref(false);
const saving = ref(false);
const editing = ref(null);
const emptyForm = () => ({
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  adresse: "",
  fonction: "",
  part: "",
  devise: "XOF",
  date_adhesion: "",
  notes: "",
});
const form = ref(emptyForm());

const openCreate = () => {
  editing.value = null;
  form.value = emptyForm();
  showModal.value = true;
};

const openEdit = (a) => {
  editing.value = a;
  form.value = Object.fromEntries(Object.keys(emptyForm()).map((key) => [key, a[key] ?? ""]));
  showModal.value = true;
};

const submit = async () => {
  saving.value = true;
  try {
    // Champs vides -> null (email, part, date...)
    const payload = Object.fromEntries(Object.entries(form.value).map(([k, v]) => [k, v === "" ? null : v]));
    if (editing.value) {
      await updateAssocie(editing.value.id, payload);
    } else {
      await createAssocie(payload);
    }
    showModal.value = false;
    await fetchAssocies();
  } catch (error) {
    alert(errorMessage(error, "Enregistrement impossible."));
  } finally {
    saving.value = false;
  }
};

const remove = async (a) => {
  if (!confirm(`Supprimer l'associé ${a.nom} ${a.prenom} ?`)) return;
  try {
    await deleteAssocie(a.id);
    await fetchAssocies();
  } catch (error) {
    alert(errorMessage(error));
  }
};

// ---------- Export ----------
const exportList = (format) => {
  if (!associes.value.length) {
    alert("Aucun associé à exporter.");
    return;
  }
  const rows = associes.value.map((a) => ({
    Nom: a.nom,
    Prénom: a.prenom,
    Email: a.email || "",
    Téléphone: a.telephone || "",
    Fonction: a.fonction || "",
    "Part du capital (%)": a.part != null ? Number(a.part) : "",
    "Date d'adhésion": a.date_adhesion || "",
    "Apports + intérêts": Number(a.total_credits || 0),
    "Remboursements + retraits": Number(a.total_debits || 0),
    Solde: Number(a.solde || 0),
    Devise: a.devise,
    Mouvements: a.mouvements_count,
    "Dernier mouvement": a.dernier_mouvement || "",
  }));
  exportRows(rows, `comptes_associes_${today()}`, format, "Comptes d'associés");
};

onMounted(fetchAssocies);
</script>
