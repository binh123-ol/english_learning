import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { BookOpen, Clock, Award, ChevronRight } from 'lucide-react'

export default function ExamList() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams')
      setExams(response.data)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExams = filter === 'all' 
    ? exams 
    : exams.filter(exam => exam.examType === filter)

  if (loading) {
    return <div className="text-center py-12">Loading exams...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Exams</h1>
          <p className="text-gray-600 mt-2">Choose an exam to start practicing</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('IELTS')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'IELTS'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          IELTS
        </button>
        <button
          onClick={() => setFilter('TOEFL')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'TOEFL'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          TOEFL
        </button>
      </div>

      {filteredExams.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No exams available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Link
              key={exam.examId}
              to={`/dashboard/exams/${exam.examId}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    {exam.examType}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{exam.durationMinutes} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Level: {exam.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Total Score: {exam.totalScore}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button className="btn btn-primary w-full">
                  Start Exam
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
