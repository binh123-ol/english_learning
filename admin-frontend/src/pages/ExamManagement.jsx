import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Plus, Edit, Trash2, BookOpen, Search, FileText, ChevronRight, MinusCircle, PlusCircle, Users, Eye } from 'lucide-react'

const QUESTION_TYPE_OPTIONS = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (A, B, C, D)' },
  { value: 'TEXT_INPUT', label: 'Short Answer' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank' },
]

const SKILL_DEFAULT_QUESTION_TYPE = {
  LISTENING: 'MULTIPLE_CHOICE',
  READING: 'MULTIPLE_CHOICE',
  WRITING: 'TEXT_INPUT',
  SPEAKING: 'TEXT_INPUT',
  GRAMMAR: 'MULTIPLE_CHOICE',
  VOCABULARY: 'FILL_BLANK',
}

const createInitialQuestionForm = () => ({
  questionType: 'MULTIPLE_CHOICE',
  skillType: 'LISTENING',
  textContent: '',
  scorePoints: 1.0,
  correctAnswerText: '',
  options: [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ],
})

export default function ExamManagement() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionAnswers, setSessionAnswers] = useState([])
  const [editingExam, setEditingExam] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [sections, setSections] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    examType: 'IELTS',
    level: 'Intermediate',
    durationMinutes: 60,
    totalScore: 40,
  })
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    instructionText: '',
    orderIndex: 1
  })
  const [questionFormData, setQuestionFormData] = useState(createInitialQuestionForm())
  const [editingQuestion, setEditingQuestion] = useState(null)

  const prepareQuestionFormForType = (state, newType) => {
    if (newType === 'MULTIPLE_CHOICE') {
      return {
        ...state,
        questionType: newType,
        correctAnswerText: '',
        options:
          state.options.length > 0
            ? state.options
            : [
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false },
              ],
      }
    }

    return {
      ...state,
      questionType: newType,
      correctAnswerText:
        newType === 'TRUE_FALSE'
          ? state.correctAnswerText === 'FALSE'
            ? 'FALSE'
            : 'TRUE'
          : '',
      options: [],
    }
  }

  const handleSkillTypeChange = (skillType) => {
    setQuestionFormData((prev) => {
      const preferredType = SKILL_DEFAULT_QUESTION_TYPE[skillType] || prev.questionType
      const withSkill = { ...prev, skillType }
      if (withSkill.questionType !== preferredType) {
        return prepareQuestionFormForType(withSkill, preferredType)
      }
      return withSkill
    })
  }

  const handleQuestionTypeChange = (questionType) => {
    setQuestionFormData((prev) => prepareQuestionFormForType(prev, questionType))
  }

  const handleOptionChange = (index, field, value) => {
    setQuestionFormData((prev) => {
      const nextOptions = prev.options.map((option, idx) =>
        idx === index ? { ...option, [field]: value } : option
      )
      return { ...prev, options: nextOptions }
    })
  }

  const handleAddOption = () => {
    setQuestionFormData((prev) => ({
      ...prev,
      options: [...prev.options, { optionText: '', isCorrect: false }],
    }))
  }

  const handleRemoveOption = (index) => {
    setQuestionFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index),
    }))
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams')
      setExams(response.data)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSections = async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}/sections`)
      setSections(response.data)
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  const fetchQuestions = async (sectionId) => {
    try {
      const response = await api.get(`/sections/${sectionId}/questions`)
      setQuestions(response.data)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleManageExam = async (exam) => {
    setSelectedExam(exam)
    await fetchSections(exam.examId)
    setShowSectionModal(true)
  }

  const handleViewSessions = async (exam) => {
    setSelectedExam(exam)
    try {
      const response = await api.get(`/sessions/exam/${exam.examId}`)
      setSessions(response.data)
      setShowSessionsModal(true)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      alert('Error fetching exam sessions')
    }
  }

  const handleViewSessionAnswers = async (session) => {
    setSelectedSession(session)
    try {
      const response = await api.get(`/sessions/${session.sessionId}/answers`)
      setSessionAnswers(response.data)
    } catch (error) {
      console.error('Error fetching session answers:', error)
      alert('Error fetching session answers')
    }
  }

  const handleCreateSection = async (e) => {
    e.preventDefault()
    try {
      // Ensure orderIndex is a valid number
      const dataToSend = {
        ...sectionFormData,
        examId: selectedExam?.examId,
        orderIndex: sectionFormData.orderIndex || sections.length + 1
      }
      await api.post(`/exams/${selectedExam.examId}/sections`, dataToSend)
      await fetchSections(selectedExam.examId)
      setSectionFormData({ title: '', instructionText: '', orderIndex: sections.length + 1 })
    } catch (error) {
      console.error('Error creating section:', error)
      let errorMessage = 'Error creating section'
      
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
      }
      
      alert(errorMessage)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure? This will delete all questions in this section.')) return
    try {
      await api.delete(`/sections/${sectionId}`)
      await fetchSections(selectedExam.examId)
    } catch (error) {
      console.error('Error deleting section:', error)
      alert('Error deleting section')
    }
  }

  const handleManageSection = async (section) => {
    setSelectedSection(section)
    await fetchQuestions(section.sectionId)
    setShowQuestionModal(true)
  }

  const handleCreateQuestion = async (e) => {
    e.preventDefault()
    try {
      if (questionFormData.questionType === 'MULTIPLE_CHOICE') {
        const filledOptions = questionFormData.options.filter((option) => option.optionText.trim() !== '')
        if (filledOptions.length < 2) {
          alert('Multiple choice questions need at least 2 answer options.')
          return
        }
        if (!filledOptions.some((option) => option.isCorrect)) {
          alert('Please mark at least one option as correct.')
          return
        }
      } else if (!questionFormData.correctAnswerText.trim()) {
        alert('Please provide the expected answer for this question.')
        return
      }

      const payload = {
        sectionId: selectedSection.sectionId,
        questionType: questionFormData.questionType,
        skillType: questionFormData.skillType,
        textContent: questionFormData.textContent,
        scorePoints: questionFormData.scorePoints,
        correctAnswerText:
          questionFormData.questionType === 'MULTIPLE_CHOICE' ? '' : questionFormData.correctAnswerText.trim(),
      }

      const createdQuestion = await api.post(`/sections/${selectedSection.sectionId}/questions`, payload)

      if (questionFormData.questionType === 'MULTIPLE_CHOICE') {
        const filledOptions = questionFormData.options.filter((option) => option.optionText.trim() !== '')
        await Promise.all(
          filledOptions.map((option) =>
            api.post(`/questions/${createdQuestion.data.questionId}/options`, {
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              explanation: option.explanation || '',
            }),
          ),
        )
      }

      await fetchQuestions(selectedSection.sectionId)
      setQuestionFormData(createInitialQuestionForm())
    } catch (error) {
      console.error('Error creating question:', error)
      let errorMessage = 'Error creating question'
      if (error.response?.data) {
        const data = error.response.data
        if (data.validationErrors) {
          errorMessage =
            'Validation errors:\n' +
            Object.entries(data.validationErrors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join('\n')
        } else if (data.message) {
          errorMessage = data.message
        } else if (typeof data === 'string') {
          errorMessage = data
        }
      }
      alert(errorMessage)
    }
  }

  const handleEditQuestion = async (question) => {
    try {
      // Fetch options if it's a multiple choice question
      let options = []
      if (question.questionType === 'MULTIPLE_CHOICE') {
        try {
          const optionsRes = await api.get(`/questions/${question.questionId}/options`)
          options = optionsRes.data
        } catch (error) {
          console.error('Error fetching options:', error)
        }
      }

      setEditingQuestion(question)
      setQuestionFormData({
        questionType: question.questionType,
        skillType: question.skillType || 'LISTENING',
        textContent: question.textContent,
        scorePoints: question.scorePoints,
        correctAnswerText: question.correctAnswerText || '',
        options: options.length > 0 
          ? options.map(opt => ({ optionText: opt.optionText, isCorrect: opt.isCorrect }))
          : [
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false },
            ],
      })
    } catch (error) {
      console.error('Error loading question for edit:', error)
      alert('Error loading question')
    }
  }

  const handleUpdateQuestion = async (e) => {
    e.preventDefault()
    try {
      if (questionFormData.questionType === 'MULTIPLE_CHOICE') {
        const filledOptions = questionFormData.options.filter((option) => option.optionText.trim() !== '')
        if (filledOptions.length < 2) {
          alert('Multiple choice questions need at least 2 answer options.')
          return
        }
        if (!filledOptions.some((option) => option.isCorrect)) {
          alert('Please mark at least one option as correct.')
          return
        }
      } else if (!questionFormData.correctAnswerText.trim()) {
        alert('Please provide the expected answer for this question.')
        return
      }

      const payload = {
        sectionId: selectedSection.sectionId,
        questionType: questionFormData.questionType,
        skillType: questionFormData.skillType,
        textContent: questionFormData.textContent,
        scorePoints: questionFormData.scorePoints,
        correctAnswerText:
          questionFormData.questionType === 'MULTIPLE_CHOICE' ? '' : questionFormData.correctAnswerText.trim(),
      }

      await api.put(`/questions/${editingQuestion.questionId}`, payload)

      // Update options for multiple choice
      if (questionFormData.questionType === 'MULTIPLE_CHOICE') {
        // Get existing options
        const existingOptionsRes = await api.get(`/questions/${editingQuestion.questionId}/options`)
        const existingOptions = existingOptionsRes.data

        // Delete all existing options
        await Promise.all(
          existingOptions.map((opt) => api.delete(`/options/${opt.optionId}`))
        )

        // Create new options
        const filledOptions = questionFormData.options.filter((option) => option.optionText.trim() !== '')
        await Promise.all(
          filledOptions.map((option) =>
            api.post(`/questions/${editingQuestion.questionId}/options`, {
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              explanation: option.explanation || '',
            }),
          ),
        )
      }

      await fetchQuestions(selectedSection.sectionId)
      setQuestionFormData(createInitialQuestionForm())
      setEditingQuestion(null)
    } catch (error) {
      console.error('Error updating question:', error)
      let errorMessage = 'Error updating question'
      if (error.response?.data) {
        const data = error.response.data
        if (data.validationErrors) {
          errorMessage =
            'Validation errors:\n' +
            Object.entries(data.validationErrors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join('\n')
        } else if (data.message) {
          errorMessage = data.message
        } else if (typeof data === 'string') {
          errorMessage = data
        }
      }
      alert(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setQuestionFormData(createInitialQuestionForm())
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await api.delete(`/questions/${questionId}`)
      await fetchQuestions(selectedSection.sectionId)
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Error deleting question')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam.examId}`, formData)
      } else {
        await api.post('/exams', formData)
      }
      fetchExams()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving exam:', error)
      alert('Failed to save exam')
    }
  }

  const handleDelete = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return
    
    try {
      await api.delete(`/exams/${examId}`)
      fetchExams()
    } catch (error) {
      console.error('Error deleting exam:', error)
      alert('Failed to delete exam')
    }
  }

  const handleEdit = (exam) => {
    setEditingExam(exam)
    setFormData({
      title: exam.title,
      examType: exam.examType,
      level: exam.level,
      durationMinutes: exam.durationMinutes,
      totalScore: exam.totalScore,
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingExam(null)
    setFormData({
      title: '',
      examType: 'IELTS',
      level: 'Intermediate',
      durationMinutes: 60,
      totalScore: 40,
    })
  }

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.examType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Loading exams...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-2">Create and manage exams</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Exam</span>
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Total Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-600">
                    No exams found
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.examId}>
                    <td className="font-medium text-gray-900">{exam.title}</td>
                    <td>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                        {exam.examType}
                      </span>
                    </td>
                    <td>{exam.level}</td>
                    <td>{exam.durationMinutes} min</td>
                    <td>{exam.totalScore}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleManageExam(exam)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Manage Sections/Questions"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewSessions(exam)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Completed Sessions"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.examId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type
                </label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="input"
                  required
                >
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="TOEIC">TOEIC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="input"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  className="input"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Score
                </label>
                <input
                  type="number"
                  value={formData.totalScore}
                  onChange={(e) => setFormData({ ...formData, totalScore: parseFloat(e.target.value) })}
                  className="input"
                  required
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingExam ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Management Modal */}
      {showSectionModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Sections: {selectedExam.title}
              </h2>
              <button
                onClick={() => {
                  setShowSectionModal(false)
                  setSelectedExam(null)
                  setSections([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Add New Section</h3>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Section Title"
                  value={sectionFormData.title}
                  onChange={(e) => setSectionFormData({...sectionFormData, title: e.target.value})}
                  className="input"
                  required
                />
                <input
                  type="text"
                  placeholder="Instructions"
                  value={sectionFormData.instructionText}
                  onChange={(e) => setSectionFormData({...sectionFormData, instructionText: e.target.value})}
                  className="input"
                />
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Order"
                    value={sectionFormData.orderIndex || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setSectionFormData({...sectionFormData, orderIndex: value ? parseInt(value) || 1 : 1})
                    }}
                    className="input flex-1"
                    min="1"
                    required
                  />
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.sectionId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold">{section.title}</h4>
                      <p className="text-sm text-gray-600">{section.instructionText}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleManageSection(section)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Manage Questions
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.sectionId)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question Management Modal */}
      {showQuestionModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Questions: {selectedSection.title}
              </h2>
              <button
                onClick={() => {
                  setShowQuestionModal(false)
                  setSelectedSection(null)
                  setQuestions([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Skill Type *</label>
                    <select
                      value={questionFormData.skillType}
                      onChange={(e) => handleSkillTypeChange(e.target.value)}
                      className="input"
                      required
                    >
                      <option value="LISTENING">🎧 Listening</option>
                      <option value="READING">📖 Reading</option>
                      <option value="WRITING">✍️ Writing</option>
                      <option value="SPEAKING">🎤 Speaking</option>
                      <option value="GRAMMAR">📝 Grammar</option>
                      <option value="VOCABULARY">📚 Vocabulary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Question Type *</label>
                    <select
                      value={questionFormData.questionType}
                      onChange={(e) => handleQuestionTypeChange(e.target.value)}
                      className="input"
                      required
                    >
                      {QUESTION_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  placeholder="Question Text"
                  value={questionFormData.textContent}
                  onChange={(e) => setQuestionFormData({...questionFormData, textContent: e.target.value})}
                  className="input"
                  rows="2"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Score Points"
                    value={questionFormData.scorePoints}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        scorePoints: Number.isNaN(parseFloat(e.target.value))
                          ? 0
                          : parseFloat(e.target.value),
                      })
                    }
                    className="input"
                    min="0"
                    step="0.1"
                    required
                  />
                  {questionFormData.questionType === 'TRUE_FALSE' && (
                    <select
                      value={questionFormData.correctAnswerText || 'TRUE'}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, correctAnswerText: e.target.value })
                      }
                      className="input"
                    >
                      <option value="TRUE">Correct answer is TRUE</option>
                      <option value="FALSE">Correct answer is FALSE</option>
                    </select>
                  )}
                  {['TEXT_INPUT', 'FILL_BLANK'].includes(questionFormData.questionType) && (
                    <input
                      type="text"
                      placeholder={
                        questionFormData.questionType === 'FILL_BLANK'
                          ? 'Expected answer (e.g., Present Simple)'
                          : 'Correct Answer'
                      }
                      value={questionFormData.correctAnswerText}
                      onChange={(e) =>
                        setQuestionFormData({ ...questionFormData, correctAnswerText: e.target.value })
                      }
                      className="input"
                    />
                  )}
                </div>
                {questionFormData.questionType === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        Answer Options (mark the correct ones)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-primary-600 text-sm flex items-center gap-1 hover:text-primary-700"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                    {questionFormData.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(idx, 'optionText', e.target.value)}
                          className="flex-1 input"
                        />
                        <label className="flex items-center gap-1 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                            className="rounded"
                          />
                          Correct
                        </label>
                        {questionFormData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove option"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex space-x-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                  {editingQuestion && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="space-y-3">
              {questions.map((question) => (
                <div key={question.questionId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{question.textContent}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded mr-2">
                          {question.questionType}
                        </span>
                        {question.skillType && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded mr-2">
                            {question.skillType}
                          </span>
                        )}
                        <span>Score: {question.scorePoints}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.questionId)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions View Modal */}
      {showSessionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Completed Sessions: {selectedExam.title}
              </h2>
              <button
                onClick={() => {
                  setShowSessionsModal(false)
                  setSelectedExam(null)
                  setSessions([])
                  setSelectedSession(null)
                  setSessionAnswers([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sessions List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Sessions ({sessions.length})</h3>
                {sessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No completed sessions yet</p>
                ) : (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedSession?.sessionId === session.sessionId
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleViewSessionAnswers(session)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {session.user?.username || session.user?.email || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {session.finishedAt
                                ? new Date(session.finishedAt).toLocaleString()
                                : 'Not finished'}
                            </p>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <span className="text-gray-600">
                                Score: <span className="font-semibold">{session.finalScore || 0}</span>
                              </span>
                              <span className="text-gray-600">
                                Correct: <span className="font-semibold">{session.totalCorrect || 0}</span>
                              </span>
                              {session.bandScore && (
                                <span className="text-gray-600">
                                  Band: <span className="font-semibold">{session.bandScore}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Answers Detail */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  Answers {selectedSession ? `(${sessionAnswers.length})` : ''}
                </h3>
                {!selectedSession ? (
                  <p className="text-gray-500 text-center py-8">Select a session to view answers</p>
                ) : sessionAnswers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No answers submitted</p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {sessionAnswers.map((answer, index) => (
                      <div key={answer.answerId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Question {index + 1}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              answer.isCorrect
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {answer.question?.textContent || 'Question text not available'}
                        </p>
                        <div className="space-y-1 text-sm">
                          {answer.selectedOption ? (
                            <div>
                              <span className="text-gray-600">Selected: </span>
                              <span className="font-medium">{answer.selectedOption.optionText}</span>
                            </div>
                          ) : answer.textResponse ? (
                            <div>
                              <span className="text-gray-600">Answer: </span>
                              <span className="font-medium">{answer.textResponse}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No answer provided</span>
                          )}
                          {answer.question?.correctAnswerText && (
                            <div>
                              <span className="text-gray-600">Correct: </span>
                              <span className="font-medium text-green-700">
                                {answer.question.correctAnswerText}
                              </span>
                            </div>
                          )}
                          <div className="text-gray-500 text-xs mt-1">
                            Score: {answer.scoreEarned || 0} / {answer.question?.scorePoints || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
