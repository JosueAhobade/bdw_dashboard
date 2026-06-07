// src/services/statisticsService.js
import api from "../api/axios";

export const getStatistics = async () => {
  const response = await api.get("/statistics");
  return response.data;
};