import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function TakeExam() {
  const { examId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const sessionId = location.state?.sessionId

  const [session, setSession] = useState(null)
  const [sections, setSections] = useState([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      navigate(`/dashboard/exams/${examId}`)
      return
    }
    fetchSessionData()
  }, [sessionId])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeRemaining === 0 && session) {
      handleFinishExam()
    }
  }, [timeRemaining])

  useEffect(() => {
    if (sections.length > 0) {
      fetchQuestions(sections[currentSectionIndex].sectionId)
      fetchExistingAnswers()
    }
  }, [currentSectionIndex, sections, sessionId])

  const fetchExistingAnswers = async () => {
    if (!sessionId) return
    try {
      const response = await api.get(`/sessions/${sessionId}/answers`)
      const answersMap = {}
      response.data.forEach((answer) => {
        if (answer.selectedOption) {
          answersMap[answer.question.questionId] = answer.selectedOption.optionId
        } else if (answer.textResponse) {
          answersMap[answer.question.questionId] = answer.textResponse
        }
      })
      setAnswers(answersMap)
    } catch (error) {
      console.error('Error fetching existing answers:', error)
      // Don't show error, just continue
    }
  }

  const fetchSessionData = async () => {
    try {
      const [sessionRes, sectionsRes] = await Promise.all([
        api.get(`/sessions/${sessionId}`),
        api.get(`/exams/${examId}/sections`),
      ])
      setSession(sessionRes.data)
      setSections(sectionsRes.data)
      
      // Fix: use startedAt instead of startTime
      const startTime = new Date(sessionRes.data.startedAt || sessionRes.data.startTime)
      const duration = sessionRes.data.exam.durationMinutes * 60
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
      setTimeRemaining(Math.max(0, duration - elapsed))
    } catch (error) {
      console.error('Error fetching session data:', error)
      alert('Error loading exam. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async (sectionId) => {
    try {
      const response = await api.get(`/sections/${sectionId}/questions`)
      const questionsWithOptions = await Promise.all(
        response.data.map(async (question) => {
          // Only fetch options for multiple choice questions
          if (question.questionType === 'MULTIPLE_CHOICE') {
            try {
              const optionsRes = await api.get(`/questions/${question.questionId}/options`)
              return { ...question, options: optionsRes.data }
            } catch (error) {
              console.error(`Error fetching options for question ${question.questionId}:`, error)
              return { ...question, options: [] }
            }
          }
          return { ...question, options: [] }
        })
      )
      setQuestions(questionsWithOptions)
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Error loading questions. Please refresh the page.')
    }
  }

  const handleAnswerSelect = async (questionId, optionId) => {
    if (!questionId || !optionId) {
      console.error('Invalid questionId or optionId:', { questionId, optionId })
      alert('Invalid question or option. Please refresh the page.')
      return
    }
    
    setAnswers({ ...answers, [questionId]: optionId })
    
    try {
      const payload = {
        questionId: questionId,
        selectedOptionId: optionId,
      }
      console.log('Submitting answer:', { sessionId, payload })
      
      const response = await api.post(`/sessions/${sessionId}/answers`, payload)
      console.log('Answer submitted successfully:', response.data)
    } catch (error) {
      console.error('Error submitting answer:', error)
      console.error('Error details:', error.response?.data)
      
      let errorMessage = 'Failed to submit answer'
      if (error.response?.data) {
        const data = error.response.data
        if (data.validationErrors) {
          // Show validation errors
          const errors = Object.entries(data.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n')
          errorMessage = `Validation errors:\n${errors}`
        } else if (data.message) {
          errorMessage = data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`Error: ${errorMessage}`)
      // Revert the answer selection on error
      setAnswers({ ...answers, [questionId]: undefined })
    }
  }

  const handleTextAnswer = async (questionId, textValue) => {
    if (!questionId) {
      console.error('Invalid questionId:', questionId)
      alert('Invalid question. Please refresh the page.')
      return
    }
    
    if (!textValue || textValue.trim() === '') {
      console.warn('Empty text response for question:', questionId)
      // Don't submit empty answers
      return
    }
    
    setAnswers({ ...answers, [questionId]: textValue })
    
    try {
      const payload = {
        questionId: questionId,
        textResponse: textValue.trim(),
      }
      console.log('Submitting text answer:', { sessionId, payload })
      
      const response = await api.post(`/sessions/${sessionId}/answers`, payload)
      console.log('Answer submitted successfully:', response.data)
    } catch (error) {
      console.error('Error submitting answer:', error)
      console.error('Error details:', error.response?.data)
      
      let errorMessage = 'Failed to submit answer'
      if (error.response?.data) {
        const data = error.response.data
        if (data.validationErrors) {
          // Show validation errors
          const errors = Object.entries(data.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n')
          errorMessage = `Validation errors:\n${errors}`
        } else if (data.message) {
          errorMessage = data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`Error: ${errorMessage}`)
      // Revert the answer on error
      setAnswers({ ...answers, [questionId]: '' })
    }
  }

  const handleFinishExam = async () => {
    try {
      const response = await api.post(`/sessions/${sessionId}/finish`)
      const sessionData = response.data
      
      // Fetch answers to calculate total questions
      try {
        const answersResponse = await api.get(`/sessions/${sessionId}/answers`)
        sessionData.answers = answersResponse.data
        sessionData.totalQuestions = answersResponse.data.length
      } catch (error) {
        console.error('Error fetching answers:', error)
        // Continue without answers
      }
      
      navigate('/dashboard/results', { state: { sessionResult: sessionData } })
    } catch (error) {
      console.error('Error finishing exam:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to finish exam'
      alert(`Error: ${errorMessage}`)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="text-center py-12">Loading exam...</div>
  }

  if (!session) {
    return <div className="text-center py-12">Session not found</div>
  }

  const currentSection = sections[currentSectionIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card sticky top-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.exam.title}</h2>
            <p className="text-sm text-gray-600">
              Section {currentSectionIndex + 1} of {sections.length}: {currentSection?.title}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              <Clock className="w-5 h-5" />
              <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={handleFinishExam}
              className="btn btn-primary"
            >
              Finish Exam
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.questionId} className="card">
            <div className="flex items-start space-x-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-900">{question.textContent || question.questionText}</p>
                <p className="text-sm text-gray-600 mt-1">Type: {question.questionType}</p>
              </div>
            </div>

            <div className="space-y-2 ml-11">
              {question.questionType === 'MULTIPLE_CHOICE' && question.options && question.options.length > 0 ? (
                question.options.map((option) => (
                  <label
                    key={option.optionId}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[question.questionId] === option.optionId
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value={option.optionId}
                      checked={answers[question.questionId] === option.optionId}
                      onChange={() => handleAnswerSelect(question.questionId, option.optionId)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-900">{option.optionText}</span>
                  </label>
                ))
              ) : question.questionType === 'TRUE_FALSE' ? (
                <div className="flex space-x-4">
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[question.questionId] === 'TRUE'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value="TRUE"
                      checked={answers[question.questionId] === 'TRUE'}
                      onChange={() => handleTextAnswer(question.questionId, 'TRUE')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-900">True</span>
                  </label>
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      answers[question.questionId] === 'FALSE'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.questionId}`}
                      value="FALSE"
                      checked={answers[question.questionId] === 'FALSE'}
                      onChange={() => handleTextAnswer(question.questionId, 'FALSE')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-900">False</span>
                  </label>
                </div>
              ) : question.questionType === 'TEXT_INPUT' || question.questionType === 'FILL_BLANK' ? (
                <input
                  type="text"
                  value={answers[question.questionId] || ''}
                  onChange={(e) => handleTextAnswer(question.questionId, e.target.value)}
                  placeholder={question.questionType === 'FILL_BLANK' ? 'Fill in the blank...' : 'Type your answer...'}
                  className="input w-full"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
            disabled={currentSectionIndex === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Section
          </button>
          
          {currentSectionIndex < sections.length - 1 ? (
            <button
              onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
              className="btn btn-primary"
            >
              Next Section
            </button>
          ) : (
            <button
              onClick={handleFinishExam}
              className="btn btn-primary"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
