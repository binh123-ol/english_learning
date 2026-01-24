import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:8080/api/auth/login', { email, password })
    const { token, ...userData } = response.data
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
