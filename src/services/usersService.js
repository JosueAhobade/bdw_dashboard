import api from "../api/axios";

export const getUsers = async () => (await api.get("/users")).data;

export const createUser = async (data) => (await api.post("/users", data)).data;

export const updateUser = async (id, data) => (await api.put(`/users/${id}`, data)).data;

export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

export const updateMyPassword = async (data) => (await api.put("/auth/password", data)).data;
