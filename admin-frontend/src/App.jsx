import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ExamManagement from './pages/ExamManagement'
import UserManagement from './pages/UserManagement'
import SessionManagement from './pages/SessionManagement'
import LessonManagement from './pages/LessonManagement'
import GameManagement from './pages/GameManagement'
import AssessmentManagement from './pages/AssessmentManagement'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="lessons" element={<LessonManagement />} />
            <Route path="games" element={<GameManagement />} />
            <Route path="assessments" element={<AssessmentManagement />} />
            <Route path="exams" element={<ExamManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="sessions" element={<SessionManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
