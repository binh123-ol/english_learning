import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

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
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      // Store userId separately for easy access
      if (parsedUser.userId) {
        localStorage.setItem('userId', parsedUser.userId)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { token, ...userData } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    // Store userId and roles separately for easy access
    if (userData.userId) {
      localStorage.setItem('userId', userData.userId)
    }
    if (userData.roles) {
      localStorage.setItem('roles', JSON.stringify(userData.roles))
    }
    setUser(userData)
    return response.data
  }

  const register = async (username, email, password, levelTarget, role) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      levelTarget,
      role
    })
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    setUser(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const updateUser = (userData) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      // Update userId separately
      if (userData.userId) {
        localStorage.setItem('userId', userData.userId)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
