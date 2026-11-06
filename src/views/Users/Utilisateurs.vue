<template>
  <!-- MODAL CRÉATION / MODIFICATION -->
  <div v-if="showModal" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">
          {{ editing ? "Modifier l'utilisateur" : "Nouvel utilisateur" }}
        </h2>
        <button @click="showModal = false" class="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label :class="labelClass">Nom *</label>
          <input v-model="form.username" type="text" :class="inputClass" required />
        </div>
        <div>
          <label :class="labelClass">Email *</label>
          <input v-model="form.email" type="email" :class="inputClass" autocomplete="off" required />
        </div>
        <div>
          <label :class="labelClass">Rôle *</label>
          <select v-model="form.role" :class="inputClass" required>
            <option v-for="role in user?.assignable_roles || []" :key="role" :value="role">
              {{ ROLE_LABELS[role] }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">{{ ROLE_HELP[form.role] }}</p>
        </div>
        <div>
          <label :class="labelClass">
            {{ editing ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *" }}
          </label>
          <input v-model="form.password" type="password" :class="inputClass" autocomplete="new-password"
            :required="!editing" minlength="8" />
          <p class="mt-1 text-xs text-gray-500">8 caractères minimum, avec des lettres et des chiffres.</p>
        </div>
        <div v-if="form.password">
          <label :class="labelClass">Confirmer le mot de passe *</label>
          <input v-model="form.password_confirmation" type="password" :class="inputClass" autocomplete="new-password"
            required />
        </div>
        <label v-if="editing" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input v-model="form.is_active" type="checkbox" />
          Compte actif
        </label>

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
    <PageBreadcrumb pageTitle="Utilisateurs" />
    <ComponentCard title="Utilisateurs" :desc="description" label_btn="Ajouter un utilisateur" @action="openCreate">
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th v-for="h in ['Nom', 'Email', 'Rôle', 'Statut', 'Dernière connexion', 'Créé par', 'Actions']" :key="h"
                  class="px-5 py-3 text-left sm:px-6">
                  <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ h }}</p>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">Chargement...</td>
              </tr>
              <tr v-else-if="!users.length">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">Aucun utilisateur pour le moment.</td>
              </tr>
              <tr v-else v-for="u in users" :key="u.id">
                <td class="px-5 py-4 sm:px-6 font-medium text-gray-800 dark:text-white">{{ u.username }}</td>
                <td class="px-5 py-4 sm:px-6 text-gray-500 dark:text-gray-400">{{ u.email }}</td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    {{ ROLE_LABELS[u.role] }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span :class="['rounded-full px-2 py-1 text-xs font-medium',
                    u.is_active ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700']">
                    {{ u.is_active ? "Actif" : "Désactivé" }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ u.last_login_at ? new Date(u.last_login_at).toLocaleString("fr-FR") : "Jamais" }}
                </td>
                <td class="px-5 py-4 sm:px-6 text-gray-500 dark:text-gray-400">{{ u.creator?.username || "-" }}</td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-2">
                    <button class="text-green-500 hover:underline border border-green-500 px-2 py-1 rounded"
                      @click="openEdit(u)">Modifier</button>
                    <button class="text-red-500 hover:underline border border-red-500 px-2 py-1 rounded"
                      @click="remove(u)">Supprimer</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ComponentCard>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { errorMessage } from "@/api/axios";
import { ROLE_LABELS, useAuth } from "@/composables/useAuth";
import { createUser, deleteUser, getUsers, updateUser } from "@/services/usersService";

const ROLE_HELP = {
  admin: "Peut créer, modifier et supprimer les opérations, et gérer les comptables.",
  accountant: "Peut uniquement consulter, télécharger les preuves et exporter.",
};

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400";

const { user } = useAuth();

const description = computed(() =>
  user.value?.role === "superadmin"
    ? "Vous pouvez gérer les administrateurs et les comptables."
    : "Vous pouvez gérer les comptables."
);

const users = ref([]);
const loading = ref(false);
const showModal = ref(false);
const saving = ref(false);
const editing = ref(null);

const emptyForm = () => ({
  username: "",
  email: "",
  role: user.value?.assignable_roles?.at(-1) || "accountant",
  password: "",
  password_confirmation: "",
  is_active: true,
});
const form = ref(emptyForm());

const fetchUsers = async () => {
  loading.value = true;
  try {
    users.value = (await getUsers()).data;
  } catch (error) {
    alert(errorMessage(error));
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editing.value = null;
  form.value = emptyForm();
  showModal.value = true;
};

const openEdit = (u) => {
  editing.value = u;
  form.value = { ...emptyForm(), username: u.username, email: u.email, role: u.role, is_active: u.is_active };
  showModal.value = true;
};

const submit = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (editing.value) {
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      await updateUser(editing.value.id, payload);
    } else {
      delete payload.is_active;
      await createUser(payload);
    }
    showModal.value = false;
    await fetchUsers();
  } catch (error) {
    alert(errorMessage(error, "Enregistrement impossible."));
  } finally {
    saving.value = false;
  }
};

const remove = async (u) => {
  if (!confirm(`Supprimer le compte de ${u.username} (${u.email}) ?`)) return;
  try {
    await deleteUser(u.id);
    await fetchUsers();
  } catch (error) {
    alert(errorMessage(error));
  }
};

onMounted(fetchUsers);
</script>
