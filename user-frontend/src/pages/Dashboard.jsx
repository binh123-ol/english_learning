import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Clock, Trophy, TrendingUp, Flame, Gamepad2, MessageCircle, Target, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    today: {
      lessonsCompleted: 0,
      gamesCompleted: 0,
      conversationsCompleted: 0,
      xpEarned: 0,
      totalTimeMinutes: 0
    },
    overall: {
      totalXP: 0,
      learningStreak: 0,
      currentLevel: null,
      levelTarget: null,
      completionRate: 0
    }
  })
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Check user data from localStorage in case context hasn't updated
    const userDataFromStorage = localStorage.getItem('user')
    if (userDataFromStorage) {
      try {
        const parsedUser = JSON.parse(userDataFromStorage)
        // If storage has assessmentCompleted but context doesn't, use storage data
        if (parsedUser.assessmentCompleted && !user.assessmentCompleted) {
          // Context will update on next render
          return
        }
        // If storage shows not completed but we're on dashboard, redirect
        if (!parsedUser.assessmentCompleted && !user.assessmentCompleted) {
          navigate('/assessment', { replace: true })
          return
        }
      } catch (e) {
        console.error('Error parsing user data from storage:', e)
      }
    } else if (user && !user.assessmentCompleted) {
      // Redirect to assessment if not completed
      navigate('/assessment', { replace: true })
      return
    }

    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    if (!user?.userId) return

    try {
      // Fetch analytics statistics
      const statsRes = await axios.get(`/analytics/users/${user.userId}/statistics`)
      setStats(statsRes.data)

      // Fetch latest assessment result
      try {
        const assessmentRes = await axios.get(`/assessments/users/${user.userId}/latest`)
        if (assessmentRes.data && assessmentRes.data.completedAt) {
          setAssessmentResult(assessmentRes.data)
        }
      } catch (error) {
        console.error('Error fetching assessment result:', error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSkillRecommendation = (skillName, score) => {
    if (!score || score >= 70) {
      return { level: 'good', message: 'Tiếp tục duy trì và nâng cao kỹ năng này', color: 'green' }
    } else if (score >= 50) {
      return { level: 'medium', message: 'Cần cải thiện thêm để đạt mục tiêu', color: 'yellow' }
    } else {
      return { level: 'weak', message: 'Cần tập trung cải thiện kỹ năng này nhiều hơn', color: 'red' }
    }
  }

  // Component for Recommended Lessons
  function RecommendedLessons({ userId }) {
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      if (!userId) {
        setLoading(false)
        return
      }

      const fetchRecommendedLessons = async () => {
        try {
          const response = await axios.get(`/lessons/users/${userId}/recommended`)
          setLessons(response.data || [])
        } catch (error) {
          console.error('Error fetching recommended lessons:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchRecommendedLessons()
    }, [userId])

    if (loading) {
      return <div className="text-center py-4 text-gray-500">Đang tải...</div>
    }

    if (lessons.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Chưa có bài học được đề xuất</p>
          <Link
            to="/dashboard/lessons"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <span>Xem tất cả bài học</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.slice(0, 6).map((lesson) => (
          <Link
            key={lesson.lessonId}
            to={`/dashboard/lessons/${lesson.lessonId}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all bg-white"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                {lesson.lessonType}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                {lesson.level}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{lesson.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{lesson.estimatedDurationMinutes || 15} phút</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{lesson.xpReward} XP</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const today = stats.today || {}
  const overall = stats.overall || {}

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại, {user?.username}!</h1>
          <p className="text-gray-600 mt-2">Theo dõi tiến trình học tập và thành tích của bạn</p>
        </div>
        {assessmentResult?.overallLevel && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Trình độ hiện tại</p>
            <p className="text-2xl font-bold text-primary-600">{assessmentResult.overallLevel}</p>
          </div>
        )}
      </div>

      {/* Assessment Results Section */}
      {assessmentResult && (
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-8 h-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kết quả đánh giá trình độ</h2>
              <p className="text-gray-600">Tổng điểm: {assessmentResult.overallScore?.toFixed(1)}/100</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { key: 'listeningScore', name: 'Listening' },
              { key: 'readingScore', name: 'Reading' },
              { key: 'writingScore', name: 'Writing' },
              { key: 'speakingScore', name: 'Speaking' },
              { key: 'grammarScore', name: 'Grammar' },
              { key: 'vocabularyScore', name: 'Vocabulary' }
            ].map(({ key, name }) => {
              const score = assessmentResult[key] || 0
              const recommendation = getSkillRecommendation(name, score)
              return (
                <div key={key} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{name}</span>
                    <span className={`font-bold ${recommendation.color === 'green' ? 'text-green-600' : recommendation.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${recommendation.color === 'green' ? 'bg-green-500' :
                        recommendation.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{recommendation.message}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Learning Path Section */}
      {assessmentResult && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lộ trình học tập đề xuất</h2>
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Dựa trên kết quả đánh giá, chúng tôi đề xuất lộ trình học tập tối ưu cho bạn:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'listeningScore', name: 'Listening', icon: '🎧' },
                { key: 'readingScore', name: 'Reading', icon: '📖' },
                { key: 'writingScore', name: 'Writing', icon: '✍️' },
                { key: 'speakingScore', name: 'Speaking', icon: '🗣️' },
                { key: 'grammarScore', name: 'Grammar', icon: '📝' },
                { key: 'vocabularyScore', name: 'Vocabulary', icon: '📚' }
              ].map(({ key, name, icon }) => {
                const score = assessmentResult[key] || 0
                const recommendation = getSkillRecommendation(name, score)
                const priority = score < 50 ? 'Cao' : score < 70 ? 'Trung bình' : 'Thấp'

                return (
                  <div key={key} className={`p-4 rounded-lg border-2 ${recommendation.color === 'red' ? 'border-red-200 bg-red-50' :
                    recommendation.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                      'border-green-200 bg-green-50'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{icon}</span>
                        <span className="font-semibold text-gray-900">{name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${recommendation.color === 'red' ? 'bg-red-200 text-red-800' :
                        recommendation.color === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                        Ưu tiên: {priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{recommendation.message}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* XP and Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total XP</p>
              <p className="text-4xl font-bold mt-2">{overall.totalXP || 0}</p>
            </div>
            <Trophy className="w-16 h-16 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Learning Streak</p>
              <p className="text-4xl font-bold mt-2">{overall.learningStreak || 0} days</p>
            </div>
            <Flame className="w-16 h-16 opacity-80" />
          </div>
        </div>
      </div>

      {/* Today's Activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động hôm nay</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.lessonsCompleted || 0}</p>
            <p className="text-sm text-gray-600">Lessons</p>
          </div>
          <div className="card text-center">
            <Gamepad2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.gamesCompleted || 0}</p>
            <p className="text-sm text-gray-600">Games</p>
          </div>
          <div className="card text-center">
            <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.conversationsCompleted || 0}</p>
            <p className="text-sm text-gray-600">Conversations</p>
          </div>
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{today.xpEarned || 0}</p>
            <p className="text-sm text-gray-600">XP Earned</p>
          </div>
        </div>
      </div>

      {/* Recommended Lessons Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bài học được đề xuất</h2>
          <Link
            to="/dashboard/lessons"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Xem tất cả →
          </Link>
        </div>
        <RecommendedLessons userId={user?.userId} />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="space-y-3">
          <Link
            to="/dashboard/lessons"
            className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Bắt đầu học</p>
                <p className="text-sm text-gray-600">Xem các bài học và bắt đầu hành trình</p>
              </div>
            </div>
          </Link>
          <Link
            to="/dashboard/games"
            className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Gamepad2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Luyện tập với Game</p>
                <p className="text-sm text-gray-600">Cải thiện kỹ năng qua các trò chơi thực hành</p>
              </div>
            </div>
          </Link>
          <Link
            to="/dashboard/pronunciation-test"
            className="block p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-pink-600" />
              <div>
                <p className="font-medium text-gray-900">Test Phát Âm</p>
                <p className="text-sm text-gray-600">Kiểm tra và cải thiện phát âm của bạn</p>
              </div>
            </div>
          </Link>
          <Link
            to="/dashboard/exams"
            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Làm bài thi</p>
                <p className="text-sm text-gray-600">Thực hành với các bài kiểm tra</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

