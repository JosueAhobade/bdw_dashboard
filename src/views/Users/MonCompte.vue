<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Mon compte" />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ComponentCard title="Informations">
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-gray-500 dark:text-gray-400">Nom</dt>
            <dd class="font-medium text-gray-800 dark:text-white/90">{{ user?.username }}</dd>
          </div>
          <div>
            <dt class="text-gray-500 dark:text-gray-400">Email</dt>
            <dd class="font-medium text-gray-800 dark:text-white/90">{{ user?.email }}</dd>
          </div>
          <div>
            <dt class="text-gray-500 dark:text-gray-400">Rôle</dt>
            <dd class="font-medium text-gray-800 dark:text-white/90">{{ ROLE_LABELS[user?.role] }}</dd>
          </div>
        </dl>
      </ComponentCard>

      <ComponentCard title="Changer mon mot de passe">
        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label :class="labelClass">Mot de passe actuel</label>
            <input v-model="form.current_password" type="password" :class="inputClass" autocomplete="current-password"
              required />
          </div>
          <div>
            <label :class="labelClass">Nouveau mot de passe</label>
            <input v-model="form.password" type="password" :class="inputClass" autocomplete="new-password" minlength="8"
              required />
            <p class="mt-1 text-xs text-gray-500">8 caractères minimum, avec des lettres et des chiffres.</p>
          </div>
          <div>
            <label :class="labelClass">Confirmer le nouveau mot de passe</label>
            <input v-model="form.password_confirmation" type="password" :class="inputClass" autocomplete="new-password"
              required />
          </div>
          <p v-if="message" :class="['text-sm whitespace-pre-line', success ? 'text-success-600' : 'text-error-600']">
            {{ message }}
          </p>
          <button type="submit" :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {{ saving ? "Enregistrement..." : "Mettre à jour" }}
          </button>
        </form>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { errorMessage } from "@/api/axios";
import { ROLE_LABELS, useAuth } from "@/composables/useAuth";
import { updateMyPassword } from "@/services/usersService";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400";

const { user } = useAuth();

const emptyForm = () => ({ current_password: "", password: "", password_confirmation: "" });
const form = ref(emptyForm());
const saving = ref(false);
const message = ref("");
const success = ref(false);

const submit = async () => {
  saving.value = true;
  message.value = "";
  try {
    await updateMyPassword(form.value);
    success.value = true;
    message.value = "Mot de passe modifié. Vos autres sessions ont été déconnectées.";
    form.value = emptyForm();
  } catch (error) {
    success.value = false;
    message.value = errorMessage(error);
  } finally {
    saving.value = false;
  }
};
</script>
