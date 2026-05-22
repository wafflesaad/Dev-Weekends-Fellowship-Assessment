import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000
});

const normalizeClientError = (error) => {
  if (error?.response?.data?.error) {
    return error.response.data;
  }

  if (error?.code === "ECONNABORTED") {
    return { error: true, code: "TIMEOUT", message: "Request timed out" };
  }

  return { error: true, code: "NETWORK_ERROR", message: "Network error" };
};

export const fetchModels = async (params) => {
  try {
    const response = await api.get("/models", { params });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeClientError(error) };
  }
};

export const fetchModelDetail = async (modelId) => {
  try {
    const response = await api.get(`/models/${modelId}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: normalizeClientError(error) };
  }
};
