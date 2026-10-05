import axios from 'axios';

const URL_BACKEND = import.meta.env.DEV 
  ? 'http://localhost:4000/api'         
  : 'https://api.asiste-usag.com.mx/api'; 

const instance = axios.create({
  baseURL: URL_BACKEND,
  withCredentials: true
});

export default instance;