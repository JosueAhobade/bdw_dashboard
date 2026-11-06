import api from "../api/axios";

export const MOUVEMENT_TYPES = [
  { value: "apport", label: "Apport", sens: "credit" },
  { value: "interets", label: "Intérêts", sens: "credit" },
  { value: "remboursement", label: "Remboursement", sens: "debit" },
  { value: "retrait", label: "Retrait", sens: "debit" },
];

export const mouvementLabel = (type) => MOUVEMENT_TYPES.find((t) => t.value === type)?.label ?? type;

export const getAssocies = async (params) => (await api.get("/associes", { params })).data;

export const getAssocie = async (id) => (await api.get(`/associes/${id}`)).data;

export const createAssocie = async (data) => (await api.post("/associes", data)).data;

export const updateAssocie = async (id, data) => (await api.put(`/associes/${id}`, data)).data;

export const deleteAssocie = async (id) => (await api.delete(`/associes/${id}`)).data;

export const getMouvements = async (associeId, params) =>
  (await api.get(`/associes/${associeId}/mouvements`, { params })).data;

export const exportMouvements = async (associeId, params) =>
  (await api.get(`/associes/${associeId}/mouvements/export`, { params })).data.data;

export const getMouvement = async (id) => (await api.get(`/mouvements-associes/${id}`)).data;

export const createMouvement = async (associeId, data) =>
  (await api.post(`/associes/${associeId}/mouvements`, data)).data;

export const updateMouvement = async (id, data) => (await api.put(`/mouvements-associes/${id}`, data)).data;

export const deleteMouvement = async (id) => (await api.delete(`/mouvements-associes/${id}`)).data;

export const uploadMouvementPreuves = async (id, files) => {
  const form = new FormData();
  files.forEach((file) => form.append("fichiers[]", file));
  return (await api.post(`/mouvements-associes/${id}/preuves`, form)).data;
};
