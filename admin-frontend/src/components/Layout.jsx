import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, Users, Activity, LogOut, Shield } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null // Don't render layout if not authenticated
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/lessons', icon: BookOpen, label: 'Lessons' },
    { path: '/games', icon: BookOpen, label: 'Games' },
    { path: '/assessments', icon: Activity, label: 'Assessments' },
    { path: '/exams', icon: BookOpen, label: 'Exams' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/sessions', icon: Activity, label: 'Sessions' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-600">English Learning</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
