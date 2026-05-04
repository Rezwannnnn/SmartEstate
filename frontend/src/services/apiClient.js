import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_URL;
const isLocalhostURL =
  typeof configuredBaseURL === "string" && /localhost|127\.0\.0\.1/i.test(configuredBaseURL);
const baseURL =
  configuredBaseURL && !(import.meta.env.PROD && isLocalhostURL)
    ? configuredBaseURL
    : import.meta.env.PROD
      ? "/api"
      : "http://localhost:5000";

const apiClient = axios.create({
  baseURL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
