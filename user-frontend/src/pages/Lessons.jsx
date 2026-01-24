import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Clock, TrendingUp, CheckCircle } from 'lucide-react'

export default function Lessons() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [learningPath, setLearningPath] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchLessons()
    fetchLearningPath()
  }, [user])

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/lessons')
      setLessons(response.data)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLearningPath = async () => {
    if (!user?.userId) return
    
    try {
      const response = await axios.get(`/lessons/users/${user.userId}/learning-path`)
      setLearningPath(response.data)
    } catch (error) {
      console.error('Error fetching learning path:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading lessons...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
        <p className="text-gray-600 mt-2">Learn English through interactive lessons</p>
      </div>

      {learningPath.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Learning Path</h2>
          <div className="space-y-3">
            {learningPath.slice(0, 5).map((path) => (
              <div key={path.pathId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {path.status === 'COMPLETED' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{path.lesson?.title}</p>
                    <p className="text-sm text-gray-600">{path.lesson?.lessonType} • {path.progressPercentage}%</p>
                  </div>
                </div>
                <Link
                  to={`/dashboard/lessons/${path.lesson?.lessonId}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {path.status === 'COMPLETED' ? 'Review' : 'Continue'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Lessons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Link
              key={lesson.lessonId}
              to={`/dashboard/lessons/${lesson.lessonId}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                  {lesson.lessonType}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {lesson.level}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{lesson.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.estimatedDurationMinutes || 15} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{lesson.xpReward} XP</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

