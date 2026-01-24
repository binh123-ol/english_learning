import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, BookOpen, Gamepad2, MessageCircle, Clock, Trophy } from 'lucide-react'

export default function Analytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchStatistics()
  }, [user])

  const fetchStatistics = async () => {
    if (!user?.userId) return
    
    try {
      const response = await axios.get(`/analytics/users/${user.userId}/statistics`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  if (!stats) {
    return <div className="text-center py-12">No statistics available</div>
  }

  const today = stats.today || {}
  const weekly = stats.weekly || {}
  const monthly = stats.monthly || {}
  const overall = stats.overall || {}

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and statistics</p>
      </div>

      {/* Today's Statistics */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.lessonsCompleted || 0}</p>
            <p className="text-sm text-gray-600">Lessons</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Gamepad2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.gamesCompleted || 0}</p>
            <p className="text-sm text-gray-600">Games</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.conversationsCompleted || 0}</p>
            <p className="text-sm text-gray-600">Conversations</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.xpEarned || 0}</p>
            <p className="text-sm text-gray-600">XP Earned</p>
          </div>
        </div>
      </div>

      {/* Weekly & Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">This Week</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Lessons Completed</span>
              <span className="font-bold">{weekly.lessonsCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Games Completed</span>
              <span className="font-bold">{weekly.gamesCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Time</span>
              <span className="font-bold">{weekly.totalTimeMinutes || 0} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total XP</span>
              <span className="font-bold">{weekly.totalXP || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">This Month</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Lessons Completed</span>
              <span className="font-bold">{monthly.lessonsCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Games Completed</span>
              <span className="font-bold">{monthly.gamesCompleted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Time</span>
              <span className="font-bold">{monthly.totalTimeMinutes || 0} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total XP</span>
              <span className="font-bold">{monthly.totalXP || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total XP</p>
            <p className="text-2xl font-bold text-gray-900">{overall.totalXP || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Learning Streak</p>
            <p className="text-2xl font-bold text-gray-900">{overall.learningStreak || 0} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Level</p>
            <p className="text-2xl font-bold text-gray-900">{overall.currentLevel || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {overall.completionRate ? `${overall.completionRate.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

