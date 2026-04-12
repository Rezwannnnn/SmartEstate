import apiClient from "./apiClient";

export const getAllProperties = (params = {}) =>
  apiClient.get("/api/properties", { params });

export const getPropertyById = (id) => apiClient.get(`/api/properties/${id}`);

export const createProperty = (payload) =>
  apiClient.post("/api/properties", payload);
