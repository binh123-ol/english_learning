import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ExamList from './pages/ExamList'
import ExamDetail from './pages/ExamDetail'
import TakeExam from './pages/TakeExam'
import Results from './pages/Results'
import Assessment from './pages/Assessment'
import Lessons from './pages/Lessons'
import LessonDetail from './pages/LessonDetail'
import Games from './pages/Games'
import GamePlay from './pages/GamePlay'
import Conversations from './pages/Conversations'
import ConversationChat from './pages/ConversationChat'
import Analytics from './pages/Analytics'
import PronunciationTest from './pages/PronunciationTest'
import Account from './pages/Account'
import LessonResult from './pages/LessonResult'
import ExamHistory from './pages/ExamHistory'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="lessons/:lessonId" element={<LessonDetail />} />
            <Route path="games" element={<Games />} />
            <Route path="games/:gameId/play" element={<GamePlay />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="conversations/:conversationId" element={<ConversationChat />} />
            <Route path="pronunciation-test" element={<PronunciationTest />} />
            <Route path="account" element={<Account />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="exams/:examId" element={<ExamDetail />} />
            <Route path="exams/:examId/take" element={<TakeExam />} />
            <Route path="exams/history/:sessionId" element={<ExamHistory />} />
            <Route path="results" element={<Results />} />
            <Route path="lessons/:lessonId/result" element={<LessonResult />} />
          </Route>

          <Route path="/assessment" element={<PrivateRoute><Assessment /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
