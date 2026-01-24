import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, Award, Clock, CheckCircle, Target, TrendingUp,
  BookOpen, Gamepad2, Calendar, Star, Zap, Home
} from 'lucide-react'
import api from '../api/axios'

export default function Results() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalXP: 0,
    gamesPlayed: 0,
    lessonsCompleted: 0,
    examsCompleted: 0,
    averageScore: 0
  })
  const [gameSessions, setGameSessions] = useState([])
  const [lessonProgress, setLessonProgress] = useState([])
  const [examSessions, setExamSessions] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchUserResults()
  }, [])

  const fetchUserResults = async () => {
    try {
      setLoading(true)

      // Get user from localStorage (set by AuthContext on login)
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        console.log('User not logged in, redirecting...')
        navigate('/login')
        return
      }

      const userData = JSON.parse(userStr)
      const userId = userData.userId || userData.id

      if (!userId) {
        console.error('No userId found in user data:', userData)
        setLoading(false)
        return
      }

      console.log('Fetching results for userId:', userId)

      // Fetch game sessions
      let currentSessions = []
      try {
        const sessionsResponse = await api.get(`/games/users/${userId}/sessions`)
        currentSessions = sessionsResponse.data || []
        setGameSessions(currentSessions)
        console.log('Game sessions loaded:', currentSessions.length)
      } catch (error) {
        console.log('Game sessions not available:', error.message)
        setGameSessions([])
      }

      // Fetch lesson progress
      let currentLessons = []
      try {
        const lessonsResponse = await api.get(`/lessons/users/${userId}/progress`)
        currentLessons = lessonsResponse.data || []
        setLessonProgress(currentLessons)
      } catch (error) {
        console.log('Lessons not available yet')
        setLessonProgress([])
      }

      // Fetch exam sessions
      let currentExams = []
      try {
        const examsResponse = await api.get(`/exams/users/${userId}/sessions`)
        currentExams = examsResponse.data || []
        setExamSessions(currentExams)
        console.log('Exam sessions loaded:', currentExams.length)
      } catch (error) {
        console.log('Exams not available yet:', error.message)
        setExamSessions([])
      }

      // Calculate statistics
      // Use the local variables instead of state
      const sessions = currentSessions
      const completedSessions = sessions.filter(s => s.completed === true)
      const averageScore = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
        : 0

      const completedExams = currentExams.filter(e => e.finishedAt !== null)

      // Calculate completed lessons (explicit completed status OR 100% progress)
      const completedLessonsCount = currentLessons.filter(l => l.status === 'COMPLETED' || Number(l.progressPercentage) >= 100).length

      // Fetch aggregate statistics to get accurate totalXP
      let totalXP = 0
      try {
        const statsResponse = await api.get(`/analytics/users/${userId}/statistics`)
        totalXP = statsResponse.data?.overall?.totalXP || 0
      } catch (error) {
        console.log('Could not fetch analytics, calculating from sessions:', error.message)
        // Fallback to manual calculation if analytics endpoint fails
        totalXP = sessions.reduce((sum, session) => sum + (session.xpEarned || 0), 0)
      }

      setStats({
        totalXP,
        gamesPlayed: completedSessions.length,  // Only count completed games
        lessonsCompleted: completedLessonsCount,
        examsCompleted: completedExams.length,
        averageScore: Math.round(averageScore)
      })

      // Combine recent activity
      const activities = [
        ...sessions.map(s => ({
          type: 'game',
          title: s.game?.title || 'Game',
          date: s.completedAt || s.startedAt,
          score: s.score,
          xp: s.xpEarned
        })),
        ...currentLessons.map(l => ({
          type: 'lesson',
          title: l.lesson?.title || 'Lesson',
          date: l.lastAccessedAt,
          progress: l.progressPercentage
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

      setRecentActivity(activities)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGameTypeIcon = (gameType) => {
    const icons = {
      'WORD_MATCH': '🎯',
      'FLASHCARD': '🃏',
      'SPELLING': '✍️',
      'QUIZ': '❓',
      'PUZZLE': '🧩'
    }
    return icons[gameType] || '🎮'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading your results...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kết Quả Học Tập</h1>
          <p className="text-gray-600 mt-1">Xem lại quá trình học tập và thành tích của bạn</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng XP</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.totalXP}</p>
            </div>
            <Zap className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Games Đã Chơi</p>
              <p className="text-3xl font-bold text-blue-600">{stats.gamesPlayed}</p>
            </div>
            <Gamepad2 className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bài Học Hoàn Thành</p>
              <p className="text-3xl font-bold text-green-600">{stats.lessonsCompleted}</p>
            </div>
            <BookOpen className="w-12 h-12 text-green-500" />
          </div>
        </div>

      </div>

      {/* My Lessons Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bảng Các Bài Học</h2>
          <BookOpen className="w-5 h-5 text-gray-400" />
        </div>

        {lessonProgress.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có bài học nào</p>
            <button
              onClick={() => navigate('/dashboard/lessons')}
              className="mt-4 btn btn-primary"
            >
              Bắt đầu học ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài Học</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời Gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến Độ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lessonProgress.slice(0, 10).map((progress, index) => (
                  <tr key={progress.progressId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📚</span>
                        <div>
                          <p className="font-medium text-gray-900">{progress.lesson?.title || 'Unknown Lesson'}</p>
                          <p className="text-sm text-gray-500">{progress.lesson?.level} - {progress.lesson?.lessonType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(progress.lastAccessedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-[150px] bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full"
                          style={{ width: `${progress.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        Tiến độ: {progress.progressPercentage}%
                        {progress.accuracyPercentage !== null && progress.accuracyPercentage !== undefined && (
                          <> • Đúng: {progress.accuracyPercentage}%</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${progress.status === 'COMPLETED' || Number(progress.progressPercentage) >= 100
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {progress.status === 'COMPLETED' || Number(progress.progressPercentage) >= 100 ? 'Hoàn thành' : 'Đang học'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Game Sessions History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Lịch Sử Games</h2>
          <Gamepad2 className="w-5 h-5 text-gray-400" />
        </div>

        {gameSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa chơi game nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời Gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gameSessions.slice(0, 10).map((session, index) => (
                  <tr key={session.sessionId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getGameTypeIcon(session.game?.gameType)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{session.game?.title || 'Unknown Game'}</p>
                          <p className="text-sm text-gray-500">{session.game?.gameType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.completedAt || session.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">{session.score || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded">
                        +{session.xpEarned || 0} XP
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${session.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {session.completed ? 'Hoàn thành' : 'Đang chơi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Exam Results Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Kết Quả Bài Thi</h2>
          <CheckCircle className="w-5 h-5 text-gray-400" />
        </div>

        {examSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa làm bài thi nào</p>
            <button
              onClick={() => navigate('/dashboard/exams')}
              className="mt-4 btn btn-primary"
            >
              Làm bài thi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bài Thi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời Gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examSessions.slice(0, 10).map((session, index) => (
                  <tr key={session.sessionId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="font-medium text-gray-900">{session.exam?.title || 'Unknown Exam'}</p>
                          <p className="text-sm text-gray-500">{session.exam?.examType} - {session.exam?.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.completedAt || session.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{session.finalScore || 0}/{session.exam?.totalScore || 100}</span>
                        <p className="text-sm text-gray-500">({Math.round(((session.finalScore || 0) / (session.exam?.totalScore || 100)) * 100)}%)</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${session.finishedAt
                          ? ((session.finalScore || 0) / (session.exam?.totalScore || 100)) >= 0.5
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {session.finishedAt
                            ? ((session.finalScore || 0) / (session.exam?.totalScore || 100)) >= 0.5
                              ? 'Đạt'
                              : 'Không đạt'
                            : 'Đang làm'}
                        </span>
                        {session.finishedAt && (
                          <button
                            onClick={() => navigate(`/dashboard/exams/history/${session.sessionId}`)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Xem Lịch Sử
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Thành Tích</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.gamesPlayed >= 1 && (
            <div className="text-center p-4 bg-white rounded-lg">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">First Game</p>
              <p className="text-xs text-gray-500">Chơi game đầu tiên</p>
            </div>
          )}
          {stats.gamesPlayed >= 5 && (
            <div className="text-center p-4 bg-white rounded-lg">
              <Award className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Game Master</p>
              <p className="text-xs text-gray-500">Chơi 5 games</p>
            </div>
          )}
          {stats.totalXP >= 100 && (
            <div className="text-center p-4 bg-white rounded-lg">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">XP Hunter</p>
              <p className="text-xs text-gray-500">Đạt 100 XP</p>
            </div>
          )}
          {stats.averageScore >= 80 && (
            <div className="text-center p-4 bg-white rounded-lg">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">High Scorer</p>
              <p className="text-xs text-gray-500">Điểm TB ≥ 80</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/games')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Chơi Game</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/lessons')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <BookOpen className="w-5 h-5" />
          <span>Học Bài</span>
        </button>
      </div>
    </div>
  )
}
