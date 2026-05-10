import api from "../api/axios";

export const getAllDepenses = async () => {
  const response = await api.get("/depenses");
  return response.data;
};

export const createDepense = async (data) => {
  const response = await api.post("/depenses", data);
  return response.data;
};

export const updateDepense = async (id, data) => {
  const response = await api.put(`/depenses/${id}`, data);
  return response.data;
};

export const deleteDepense = async (id) => {
  const response = await api.delete(`/depenses/${id}`);
  return response.data;
};

export const getDepenseById = async (id) => {
  const response = await api.get(`/depenses/${id}`);
  return response.data;
};