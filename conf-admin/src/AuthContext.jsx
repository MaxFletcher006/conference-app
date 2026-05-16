import { createContext, useContext, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  async function login(email, password) {
    const params = new URLSearchParams({ email, password })
    const res = await api.post(`/login?${params}`)
    const data = res.data
    if (data.role !== 'admin' && data.role !== 'supervisor') {
      await api.post('/logout')
      throw new Error('Access denied: insufficient role')
    }
    setUser(data)
    return data
  }

  async function logout() {
    await api.post('/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
