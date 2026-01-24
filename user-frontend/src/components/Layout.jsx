import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatBotButton from './ChatBotButton'
import { BookOpen, LogOut, User, Trophy } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">English Learning</span>
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link to="/dashboard/lessons" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100">
                  Lessons
                </Link>
                <Link to="/dashboard/games" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100">
                  Games
                </Link>
                <Link to="/dashboard/pronunciation-test" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100">
                  Speaking Test
                </Link>
                <Link to="/dashboard/exams" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100">
                  Exams
                </Link>
                <Link to="/dashboard/results" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100">
                  Results
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/account"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Floating Chat Bot Button */}
      <ChatBotButton />
    </div>
  )
}
