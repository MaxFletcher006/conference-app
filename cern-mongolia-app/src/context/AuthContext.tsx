import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, login as apiLogin, logout as apiLogout } from '../api/client'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })  

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('cern_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { sessionStorage.removeItem('cern_user') }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password)
    setUser(u)
    sessionStorage.setItem('cern_user', JSON.stringify(u))
    return u
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
    sessionStorage.removeItem('cern_user')
  }

  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const isDashboardRole = (role: string) =>
  ['admin', 'supervisor', 'staff'].includes(role)
