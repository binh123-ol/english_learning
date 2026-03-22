import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatBotButton from './ChatBotButton'
import { BookOpen, LogOut, User, Trophy, MessageCircle, PenTool, LayoutDashboard, Gamepad2, FileText, Settings, Menu, X } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              <div className="hidden md:flex items-center space-x-1">
                {[
                  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { to: '/dashboard/lessons', label: 'Lessons', icon: BookOpen },
                  { to: '/dashboard/games', label: 'Games', icon: Gamepad2 },
                  { to: '/dashboard/conversations', label: 'Conversations', icon: MessageCircle },
                  { to: '/dashboard/writing-practice', label: 'Writing', icon: PenTool },
                  { to: '/dashboard/exams', label: 'Exams', icon: FileText },
                  { to: '/dashboard/results', label: 'Results', icon: Trophy },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <a 
                    href="http://localhost:5174" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-2 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 border border-transparent hover:border-purple-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/dashboard/account"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-semibold hidden lg:block">{user?.username}</span>
                </Link>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 sm:hidden transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t border-gray-100 bg-white`}>
          <div className="pt-2 pb-3 space-y-1">
            {[
              { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/dashboard/lessons', label: 'Lessons', icon: BookOpen },
              { to: '/dashboard/games', label: 'Games', icon: Gamepad2 },
              { to: '/dashboard/conversations', label: 'Conversations', icon: MessageCircle },
              { to: '/dashboard/writing-practice', label: 'Writing', icon: PenTool },
              { to: '/dashboard/exams', label: 'Exams', icon: FileText },
              { to: '/dashboard/results', label: 'Results', icon: Trophy },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-100">
            <div className="flex items-center px-4 mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 font-medium text-gray-800">{user?.username}</div>
            </div>
            <div className="space-y-1">
               <Link
                to="/dashboard/account"
                className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span>Hồ sơ tài khoản</span>
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center space-x-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Đăng xuất</span>
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
