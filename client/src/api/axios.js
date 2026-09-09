import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.asiste-usag.com.mx/api', // O la ruta exacta de tu backend público
  withCredentials: true
});

export default instance;