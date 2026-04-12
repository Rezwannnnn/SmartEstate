import apiClient from "./apiClient";

export const registerUser = (payload) => apiClient.post("/api/auth/register", payload);
export const loginUser = (payload) => apiClient.post("/api/auth/login", payload);
