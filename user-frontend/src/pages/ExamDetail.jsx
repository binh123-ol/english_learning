import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BookOpen, Clock, Award, Play, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ExamDetail() {
  const { examId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExamDetails()
  }, [examId])

  const fetchExamDetails = async () => {
    try {
      const [examRes, sectionsRes] = await Promise.all([
        axios.get(`/api/exams/${examId}`),
        axios.get(`/api/exams/${examId}/sections`),
      ])
      setExam(examRes.data)
      setSections(sectionsRes.data)
    } catch (error) {
      console.error('Error fetching exam details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async () => {
    try {
      const response = await axios.post(`/api/sessions?userId=${user.userId}&examId=${examId}`)
      navigate(`/dashboard/exams/${examId}/take`, { state: { sessionId: response.data.sessionId } })
    } catch (error) {
      console.error('Error starting exam:', error)
      alert('Failed to start exam. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading exam details...</div>
  }

  if (!exam) {
    return <div className="text-center py-12">Exam not found</div>
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard/exams')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Exams</span>
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
              <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded">
                {exam.examType}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-bold text-gray-900">{exam.durationMinutes} min</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-lg font-bold text-gray-900">{exam.level}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-lg font-bold text-gray-900">{exam.totalScore}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sections</h2>
          {sections.length === 0 ? (
            <p className="text-gray-600">No sections available</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.sectionId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Section {index + 1}: {section.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      Order: {section.orderIndex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleStartExam}
          className="btn btn-primary w-full md:w-auto flex items-center justify-center space-x-2"
        >
          <Play className="w-5 h-5" />
          <span>Start Exam</span>
        </button>
      </div>
    </div>
  )
}
