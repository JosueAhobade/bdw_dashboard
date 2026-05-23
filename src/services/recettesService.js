import api from "../api/axios";

export const getAllRecettes = async () => {
  const response = await api.get("/recettes");
  return response.data;
};

export const createRecette = async (data) => {
  const response = await api.post("/recettes", data);
  return response.data;
};

export const updateRecette = async (id, data) => {
  const response = await api.put(`/recettes/${id}`, data);
  return response.data;
};

export const deleteRecette = async (id) => {
  const response = await api.delete(`/recettes/${id}`);
  return response.data;
};

export const getRecetteById = async (id) => {
  const response = await api.get(`/recettes/${id}`);
  return response.data;
};