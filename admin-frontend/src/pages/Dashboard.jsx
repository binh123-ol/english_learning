import { useEffect, useState } from 'react'
import api from '../api/axios'
import { BookOpen, Users, Activity, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalUsers: 0,
    totalLessons: 0,
    totalGames: 0,
    totalSessions: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [examsRes, usersRes, lessonsRes, gamesRes, sessionsRes] = await Promise.all([
        api.get('/exams').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/lessons').catch(() => ({ data: [] })),
        api.get('/games').catch(() => ({ data: [] })),
        api.get('/sessions').catch(() => ({ data: [] })),
      ])
      
      setStats({
        totalExams: examsRes?.data?.length || 0,
        totalUsers: usersRes?.data?.length || 0,
        totalLessons: lessonsRes?.data?.length || 0,
        totalGames: gamesRes?.data?.length || 0,
        totalSessions: sessionsRes?.data?.length || 0,
        activeUsers: 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default stats on error
      setStats({
        totalExams: 0,
        totalUsers: 0,
        totalLessons: 0,
        totalGames: 0,
        totalSessions: 0,
        activeUsers: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lessons</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLessons}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Games</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalGames}</p>
            </div>
            <Activity className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalExams}</p>
            </div>
            <BookOpen className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSessions}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Exams Created Today</span>
              <span className="font-bold text-gray-900">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">New Users Today</span>
              <span className="font-bold text-gray-900">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Sessions Today</span>
              <span className="font-bold text-gray-900">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
