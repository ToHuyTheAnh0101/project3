import axios from "axios";

const httpClient = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

// Interceptor: gắn token vào mỗi request
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: xử lý lỗi chung (401, 500, ...)
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — redirect to login");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Hàm chung cho mọi method
const request = async (method, url, data, config = {}) => {
  try {
    const res = await httpClient({
      method,
      url,
      data,
      ...config,
    });
    console.log(res);
    return res;
  } catch (error) {
    // Xử lý hoặc log lỗi ở đây
    console.error(`API ${method.toUpperCase()} ${url} failed:`, error);
    throw error;
  }
};

export default request;
