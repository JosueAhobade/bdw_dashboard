import { computed, ref } from "vue";
import api, { TOKEN_KEY } from "@/api/axios";

export type Role = "superadmin" | "admin" | "accountant";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: Role;
  assignable_roles: Role[];
  can_manage_operations: boolean;
}

export const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super-admin",
  admin: "Administrateur",
  accountant: "Comptable",
};

// État partagé par toute l'application
const user = ref<AuthUser | null>(null);
let loadingMe: Promise<AuthUser | null> | null = null;

const isAuthenticated = computed(() => !!user.value);
const canManageOperations = computed(() => !!user.value?.can_manage_operations);
const canManageUsers = computed(() => (user.value?.assignable_roles || []).length > 0);

const hasToken = () => !!localStorage.getItem(TOKEN_KEY);

const login = async (email: string, password: string): Promise<AuthUser> => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  user.value = data.user;
  return data.user;
};

/**
 * Charge l'utilisateur courant (une seule requête même si appelé en parallèle).
 */
const fetchMe = async (): Promise<AuthUser | null> => {
  if (!hasToken()) return null;
  if (user.value) return user.value;
  if (!loadingMe) {
    loadingMe = api
      .get("/auth/me")
      .then(({ data }) => (user.value = data as AuthUser))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        user.value = null;
        return null;
      })
      .finally(() => (loadingMe = null));
  }
  return loadingMe;
};

const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // jeton déjà invalide : rien à faire
  }
  localStorage.removeItem(TOKEN_KEY);
  user.value = null;
};

const hasRole = (...roles: Role[]) => !!user.value && roles.includes(user.value.role);

export function useAuth() {
  return {
    user,
    isAuthenticated,
    canManageOperations,
    canManageUsers,
    hasToken,
    login,
    fetchMe,
    logout,
    hasRole,
  };
}
