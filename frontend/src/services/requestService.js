import apiClient from "./apiClient";

export const getAllRequests = () =>
  apiClient.get("/api/requests");

export const getRequestById = (id) =>
  apiClient.get(`/api/requests/${id}`);

export const createRequest = (payload) =>
  apiClient.post("/api/requests", payload);

export const updateRequestStatus = (id, payload) =>
  apiClient.put(`/api/requests/${id}`, payload);

export const downloadRequestAgreement = (id) =>
  apiClient.get(`/api/requests/${id}/agreement`, {
    responseType: "blob",
  });