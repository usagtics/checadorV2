import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.100.78:4000/api',
  withCredentials: true,
});

export default instance;