import api from "../api/axios";

/**
 * Service générique pour les opérations (kind = "depenses" | "recettes").
 */
export const operationsService = (kind) => ({
  list: async (params) => (await api.get(`/${kind}`, { params })).data,

  exportAll: async (params) => (await api.get(`/${kind}/export`, { params })).data.data,

  options: async () => (await api.get(`/${kind}/options`)).data,

  get: async (id) => (await api.get(`/${kind}/${id}`)).data,

  create: async (data) => (await api.post(`/${kind}`, data)).data,

  update: async (id, data) => (await api.put(`/${kind}/${id}`, data)).data,

  remove: async (id) => (await api.delete(`/${kind}/${id}`)).data,

  uploadPreuves: async (id, files) => {
    const form = new FormData();
    files.forEach((file) => form.append("fichiers[]", file));
    return (await api.post(`/${kind}/${id}/preuves`, form)).data;
  },
});

export const deletePreuve = async (id) => (await api.delete(`/preuves/${id}`)).data;

/**
 * Télécharge une preuve (requête authentifiée -> blob -> lien temporaire).
 */
export const downloadPreuve = async (preuve) => {
  const response = await api.get(`/preuves/${preuve.id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = preuve.original_name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Ouvre une preuve dans un nouvel onglet (aperçu PDF / image).
 */
export const previewPreuve = async (preuve) => {
  const tab = window.open("", "_blank");
  const response = await api.get(`/preuves/${preuve.id}/download`, { responseType: "blob" });
  const blob = new Blob([response.data], { type: preuve.mime_type });
  const url = URL.createObjectURL(blob);
  if (tab) {
    tab.location.href = url;
  } else {
    window.location.href = url;
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
