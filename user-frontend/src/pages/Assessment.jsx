import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, Clock, TrendingUp, ArrowRight, ArrowLeft, Play, Pause, Mic, StopCircle, Upload } from 'lucide-react'

const SKILL_NAMES = {
  LISTENING: 'Listening',
  READING: 'Reading',
  WRITING: 'Writing',
  SPEAKING: 'Speaking',
  GRAMMAR: 'Grammar',
  VOCABULARY: 'Vocabulary'
}

export default function Assessment() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions] = useState({})
  const [answers, setAnswers] = useState({})
  const [currentSkill, setCurrentSkill] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [audioUrls, setAudioUrls] = useState({}) // For SPEAKING questions - user's recorded audio
  const [recording, setRecording] = useState({}) // Track which question is being recorded
  const [playingAudio, setPlayingAudio] = useState({}) // Track which audio is playing
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef({})

  const skillTypes = ['LISTENING', 'READING', 'WRITING', 'SPEAKING', 'GRAMMAR', 'VOCABULARY']

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Check if user has already completed assessment (check both context and localStorage)
    const userFromStorage = localStorage.getItem('user')
    let assessmentCompleted = user.assessmentCompleted
    
    if (userFromStorage) {
      try {
        const parsedUser = JSON.parse(userFromStorage)
        assessmentCompleted = parsedUser.assessmentCompleted || user.assessmentCompleted
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
    
    if (assessmentCompleted && !result) {
      navigate('/dashboard', { replace: true })
      return
    }
    
    // Don't start new assessment if result already exists (prevent re-creating)
    // Only start if we don't have assessment and result yet
    if (!assessment && !result && !assessmentCompleted) {
      startAssessment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, result])

  const startAssessment = async () => {
    if (!user?.userId) {
      alert('Vui lòng đăng nhập để bắt đầu assessment.')
      navigate('/login')
      return
    }

    // Check if user has already completed assessment from context
    if (user.assessmentCompleted) {
      navigate('/dashboard', { replace: true })
      return
    }

    // Double check from localStorage
    const userFromStorage = localStorage.getItem('user')
    if (userFromStorage) {
      try {
        const parsedUser = JSON.parse(userFromStorage)
        if (parsedUser.assessmentCompleted) {
          // Update context and redirect
          if (updateUser) {
            updateUser(parsedUser)
          }
          navigate('/dashboard', { replace: true })
          return
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Check if token exists
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      navigate('/login')
      return
    }
    
    // Don't create if result already exists
    if (result) {
      return
    }
    
    try {
      setLoading(true)
      
      // First, check if there's an existing completed assessment
      try {
        const latestAssessment = await axios.get(`/assessments/users/${user.userId}/latest`)
        if (latestAssessment.data && latestAssessment.data.completedAt) {
          // User already has a completed assessment, update user state and redirect
          const updatedUser = { ...user, assessmentCompleted: true, currentLevel: latestAssessment.data.overallLevel }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          if (updateUser) {
            updateUser(updatedUser)
          }
          navigate('/dashboard', { replace: true })
          return
        }
      } catch (checkError) {
        // If no existing assessment, continue to create new one
        console.log('No existing assessment found, creating new one')
      }
      
      const response = await axios.post(`/assessments/users/${user.userId}`)
      setAssessment(response.data)
      
      // Load questions
      const questionsResponse = await axios.get(`/assessments/${response.data.assessmentId}/questions`)
      setQuestions(questionsResponse.data.questionsBySkill)
    } catch (error) {
      console.error('Error starting assessment:', error)
      
      if (error.response) {
        const status = error.response.status
        if (status === 401 || status === 403) {
          alert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.')
          navigate('/login')
        } else if (status === 404) {
          alert('Không tìm thấy thông tin user. Vui lòng thử lại.')
        } else {
          alert(`Lỗi: ${error.response.data?.message || 'Không thể bắt đầu assessment. Vui lòng thử lại.'}`)
        }
      } else {
        alert('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Audio recording functions for SPEAKING
  const startRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await uploadAudioFile(questionId, audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current[questionId] = audioChunks
      setRecording(prev => ({ ...prev, [questionId]: true }))
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to record your answer.')
    }
  }

  const stopRecording = (questionId) => {
    if (mediaRecorderRef.current && recording[questionId]) {
      mediaRecorderRef.current.stop()
      setRecording(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const uploadAudioFile = async (questionId, audioBlob) => {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `speaking-${questionId}.webm`)

      const response = await axios.post('/files/upload/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const audioUrl = `http://localhost:8080${response.data.url}`
      setAudioUrls(prev => ({ ...prev, [questionId]: audioUrl }))
    } catch (error) {
      console.error('Error uploading audio:', error)
      alert('Error uploading audio. Please try again.')
    }
  }

  const handleFileUpload = async (questionId, file) => {
    if (file && file.type.startsWith('audio/')) {
      await uploadAudioFile(questionId, file)
    } else {
      alert('Please select an audio file.')
    }
  }

  const playAudio = (audioUrl, questionId) => {
    const audio = new Audio(audioUrl)
    audio.play()
    setPlayingAudio(prev => ({ ...prev, [questionId]: true }))
    
    audio.onended = () => {
      setPlayingAudio(prev => ({ ...prev, [questionId]: false }))
    }
    
    audio.onerror = () => {
      setPlayingAudio(prev => ({ ...prev, [questionId]: false }))
      alert('Error playing audio')
    }
  }

  const handleNext = () => {
    if (currentSkill < skillTypes.length - 1) {
      setCurrentSkill(currentSkill + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSkill > 0) {
      setCurrentSkill(currentSkill - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all questions are answered
    const allQuestions = Object.values(questions).flat().filter(q => q && q.questionId)
    const unanswered = allQuestions.filter(q => {
      // For SPEAKING questions, check if audio is uploaded/recorded
      if (q.skillType === 'SPEAKING') {
        const hasAudio = audioUrls[q.questionId] && typeof audioUrls[q.questionId] === 'string' && audioUrls[q.questionId].trim() !== ''
        const hasText = answers[q.questionId] && typeof answers[q.questionId] === 'string' && answers[q.questionId].trim() !== ''
        return !hasAudio && !hasText
      }
      
      // For other question types, check if answer exists and is not empty
      const answer = answers[q.questionId]
      
      // Check if answer is undefined, null, or empty string
      if (answer === undefined || answer === null || answer === '') {
        return true // Unanswered
      }
      
      // For text inputs, check if not empty string after trim
      if (q.questionType === 'TEXT_INPUT' || q.questionType === 'FILL_BLANK') {
        if (typeof answer !== 'string' || answer.trim() === '') {
          return true // Unanswered
        }
        return false // Answered
      }
      
      // For multiple choice and true/false, check if it's a valid non-empty value
      if (q.questionType === 'MULTIPLE_CHOICE' || q.questionType === 'TRUE_FALSE') {
        // Ensure it's a valid non-empty string
        if (typeof answer !== 'string' || answer.trim() === '') {
          return true // Unanswered
        }
        return false // Answered
      }
      
      // For other types, consider answered if value exists and is not empty
      if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        return true // Unanswered
      }
      
      return false // Answered
    })
    
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} question(s) remaining.`)
      return
    }

    setSubmitting(true)

    try {
      // Convert answers to API format
      const answerList = Object.entries(answers).map(([questionId, value]) => {
        const question = allQuestions.find(q => q.questionId === questionId)
        const answer = {
          questionId: questionId
        }
        
        if (question.questionType === 'MULTIPLE_CHOICE') {
          answer.selectedOptionId = value
        } else {
          answer.textResponse = value
        }
        
        // Add audio URL for SPEAKING questions
        if (question.skillType === 'SPEAKING' && audioUrls[questionId]) {
          answer.audioFileUrl = audioUrls[questionId]
        }
        
        return answer
      })

      const response = await axios.post(
        `/assessments/${assessment.assessmentId}/submit`,
        answerList
      )
      
      setResult(response.data)
      
      // Update user data in localStorage and context immediately
      const updatedUser = { ...user, assessmentCompleted: true, currentLevel: response.data.overallLevel }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Update user state in context to prevent re-creating assessment
      if (updateUser) {
        updateUser(updatedUser)
      }
      
      // Auto redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 3000)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Error submitting assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Assessment Complete!</h1>
          <p className="text-gray-600 mt-2">Your English level has been determined</p>
        </div>

        <div className="card space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary-600 mb-2">
              {result.overallLevel}
            </div>
            <div className="text-2xl text-gray-600">
              Overall Score: {result.overallScore.toFixed(1)}/100
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {result.correctAnswers} out of {result.totalQuestions} questions correct
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {skillTypes.map(skill => (
              <div key={skill} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{SKILL_NAMES[skill]}</span>
                  <span className="text-primary-600 font-bold">
                    {result[skill.toLowerCase() + 'Score']?.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${result[skill.toLowerCase() + 'Score'] || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700"
          >
            Đi đến Dashboard
          </button>
          <p className="text-center text-sm text-gray-500">
            Bạn sẽ được chuyển đến Dashboard sau 3 giây...
          </p>
        </div>
      </div>
    )
  }

  const currentSkillType = skillTypes[currentSkill]
  const currentQuestions = questions[currentSkillType] || []
  const progress = ((currentSkill + 1) / skillTypes.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Level Assessment</h1>
        <p className="text-gray-600 mt-2">
          Complete this assessment to determine your English level
        </p>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Section {currentSkill + 1} of {skillTypes.length}: {SKILL_NAMES[currentSkillType]}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {SKILL_NAMES[currentSkillType]} Questions
          </h2>
          
          <div className="space-y-6">
            {currentQuestions.map((question, index) => (
              <div key={question.questionId} className="border-b pb-6 last:border-b-0">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Question {index + 1}</span>
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                      {SKILL_NAMES[question.skillType]}
                    </span>
                  </div>
                  
                  {/* Reading Passage for READING questions */}
                  {question.skillType === 'READING' && question.readingPassage && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200 mb-4">
                      <h3 className="text-sm font-semibold text-green-800 mb-2">📖 Reading Passage:</h3>
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {question.readingPassage}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {question.textContent}
                  </p>
                  {question.scorePoints && (
                    <span className="text-xs text-gray-400">
                      ({question.scorePoints} points)
                    </span>
                  )}
                  
                  {/* Audio player for LISTENING questions */}
                  {question.skillType === 'LISTENING' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {question.audioFileUrl ? (
                            <>
                              <audio
                                id={`audio-${question.questionId}`}
                                controls
                                className="flex-1 max-w-md"
                                onPlay={() => setPlayingAudio(prev => ({ ...prev, [question.questionId]: true }))}
                                onPause={() => setPlayingAudio(prev => ({ ...prev, [question.questionId]: false }))}
                                onEnded={() => setPlayingAudio(prev => ({ ...prev, [question.questionId]: false }))}
                              >
                                <source src={question.audioFileUrl} type="audio/mpeg" />
                                <source src={question.audioFileUrl} type="audio/wav" />
                                <source src={question.audioFileUrl} type="audio/ogg" />
                                Your browser does not support the audio element.
                              </audio>
                              <p className="text-sm text-gray-600 hidden md:block">
                                Listen to the audio and answer the question below
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center space-x-3 text-amber-600">
                              <div className="animate-pulse">
                                <Play className="w-5 h-5" />
                              </div>
                              <p className="text-sm font-medium">
                                ⚠️ Audio file chưa được thêm vào câu hỏi này. Vui lòng liên hệ admin để thêm audio.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {question.audioFileUrl && (
                        <p className="text-xs text-gray-500 mt-2 md:hidden">
                          Listen to the audio and answer the question below
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.optionId}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name={question.questionId}
                          value={option.optionId}
                          checked={answers[question.questionId] === option.optionId}
                          onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                          className="mr-3"
                          required
                        />
                        <span className="text-gray-700">{option.optionText}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(question.questionType === 'TEXT_INPUT' || question.questionType === 'FILL_BLANK') && (
                  <div className="space-y-3">
                    {/* WRITING questions - text input */}
                    {question.skillType === 'WRITING' && (
                      <div>
                        <textarea
                    value={answers[question.questionId] || ''}
                    onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                          rows="6"
                          placeholder="Write your answer here..."
                    required
                  />
                        <p className="text-xs text-gray-500 mt-1">
                          ✍️ Write your response in the text box above
                        </p>
                      </div>
                    )}
                    
                    {/* SPEAKING questions - audio recording */}
                    {question.skillType === 'SPEAKING' && (
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          🎤 {question.textContent}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          Record your answer or upload an audio file. AI will evaluate your pronunciation.
                        </p>
                        <div className="flex items-center space-x-3">
                          {!recording[question.questionId] ? (
                            <>
                              <button
                                type="button"
                                onClick={() => startRecording(question.questionId)}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                <Mic className="w-4 h-4" />
                                <span>Start Recording</span>
                              </button>
                              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span>Upload Audio</span>
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) handleFileUpload(question.questionId, file)
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => stopRecording(question.questionId)}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              <StopCircle className="w-4 h-4" />
                              <span>Stop Recording</span>
                            </button>
                          )}
                        </div>
                        {audioUrls[question.questionId] && (
                          <div className="mt-3 p-2 bg-white rounded border">
                            <p className="text-sm text-green-600 mb-2">✓ Audio recorded successfully</p>
                            <audio controls src={audioUrls[question.questionId]} className="w-full" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {question.questionType === 'TRUE_FALSE' && (
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={question.questionId}
                        value="true"
                        checked={answers[question.questionId] === 'true'}
                        onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                        className="mr-3"
                        required
                      />
                      <span className="text-gray-700">True</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={question.questionId}
                        value="false"
                        checked={answers[question.questionId] === 'false'}
                        onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                        className="mr-3"
                        required
                      />
                      <span className="text-gray-700">False</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentSkill === 0}
            className="flex items-center px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentSkill === skillTypes.length - 1 ? (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
