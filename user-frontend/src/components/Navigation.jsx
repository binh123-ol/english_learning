import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, MessageCircle, FileText, BarChart3, Trophy, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Lessons', href: '/dashboard/lessons', icon: BookOpen },
    { name: 'Games', href: '/dashboard/games', icon: Gamepad2 },
    { name: 'Conversations', href: '/dashboard/conversations', icon: MessageCircle },
    { name: 'Tests', href: '/dashboard/exams', icon: FileText },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Results', href: '/dashboard/results', icon: Trophy },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
                EnglishTests
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      isActiveLink(item.href)
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.username}</p>
                {user?.currentLevel && (
                  <p className="text-xs text-gray-500">{user.currentLevel}</p>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActiveLink(item.href)
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              logout();
            }}
            className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
          >
            <div className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}