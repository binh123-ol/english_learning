import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Setup axios default baseURL
axios.defaults.baseURL = 'http://localhost:8080'

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
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password })
    const { token, ...userData } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    // Store userId separately for easy access by game sessions
    if (userData.userId) {
      localStorage.setItem('userId', userData.userId)
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return response.data
  }

  const register = async (username, email, password, levelTarget) => {
    const response = await axios.post('/api/auth/register', {
      username,
      email,
      password,
      levelTarget,
    })
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    delete axios.defaults.headers.common['Authorization']
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
