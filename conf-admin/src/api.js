import axios from 'axios'

const api = axios.create({
  baseURL: 'https://conference-app-production-2e0e.up.railway.app',
  withCredentials: true,
})

export default api
