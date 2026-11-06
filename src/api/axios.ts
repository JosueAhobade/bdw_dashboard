import axios, { type AxiosError } from "axios";

export const TOKEN_KEY = "bdw_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Ajoute le jeton Sanctum à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jeton expiré / révoqué : retour à la page de connexion
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/signin") {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/signin?redirect=${redirect}`;
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Message lisible à partir d'une erreur axios (validation Laravel incluse).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorMessage = (error: any, fallback = "Une erreur est survenue."): string => {
  const data = error?.response?.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join("\n");
  }
  if (error?.response?.status === 403) {
    return data?.message || "Action non autorisée pour votre rôle.";
  }
  if (error?.response?.status === 429) {
    return "Trop de tentatives. Réessayez dans une minute.";
  }
  return data?.message || fallback;
};

export default api;
