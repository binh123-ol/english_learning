import { useState, useEffect } from 'react'
import api from '../api/axios'
import { ClipboardList, Eye, Plus, Edit, Trash2, FileText, Settings, Upload } from 'lucide-react'

export default function AssessmentManagement() {
  const [activeTab, setActiveTab] = useState('assessments') // 'assessments' or 'questions' or 'templates'
  const [assessments, setAssessments] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionFormData, setQuestionFormData] = useState({
    skillType: 'LISTENING',
    questionType: 'MULTIPLE_CHOICE',
    textContent: '',
    audioFileUrl: '', // For LISTENING questions
    readingPassage: '', // For READING questions
    scorePoints: 20.0,
    correctAnswerText: '',
    difficultyLevel: 'INTERMEDIATE',
    orderIndex: 1,
    options: [{ optionText: '', isCorrect: false, orderIndex: 1 }]
  })
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [templateName, setTemplateName] = useState('')

  useEffect(() => {
    fetchUsers()
    if (selectedUser) {
      fetchAssessments()
    }
    if (activeTab === 'questions') {
      fetchQuestions()
    }
  }, [selectedUser, activeTab, selectedSkill])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssessments = async () => {
    if (!selectedUser) return
    
    try {
      const response = await api.get(`/assessments/users/${selectedUser}`)
      setAssessments(response.data)
    } catch (error) {
      console.error('Error fetching assessments:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      let response
      if (selectedSkill) {
        response = await api.get(`/assessments/questions/skill/${selectedSkill}`)
      } else {
        response = await api.get('/assessments/questions')
      }
      setQuestions(response.data)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleCreateQuestion = async (e) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        await api.put(`/assessments/questions/${editingQuestion.questionId}`, questionFormData)
      } else {
        await api.post('/assessments/questions', questionFormData)
      }
      setShowQuestionForm(false)
      setEditingQuestion(null)
      resetQuestionForm()
      fetchQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Error saving question. Please try again.')
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    try {
      await api.delete(`/assessments/questions/${questionId}`)
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Error deleting question. Please try again.')
    }
  }

  const handleEditQuestion = async (question) => {
    try {
      const fullQuestion = await api.get(`/assessments/questions/${question.questionId}`)
      setEditingQuestion(fullQuestion.data)
      
      // Fetch options if multiple choice
      if (fullQuestion.data.questionType === 'MULTIPLE_CHOICE') {
        // Options should be included in the response, but if not, we'll handle it
        const options = fullQuestion.data.options || []
        setQuestionFormData({
          skillType: fullQuestion.data.skillType,
          questionType: fullQuestion.data.questionType,
          textContent: fullQuestion.data.textContent,
          audioFileUrl: fullQuestion.data.audioFileUrl || '',
          readingPassage: fullQuestion.data.readingPassage || '',
          scorePoints: fullQuestion.data.scorePoints,
          correctAnswerText: fullQuestion.data.correctAnswerText || '',
          difficultyLevel: fullQuestion.data.difficultyLevel,
          orderIndex: fullQuestion.data.orderIndex,
          options: options.length > 0 ? options : [{ optionText: '', isCorrect: false, orderIndex: 1 }]
        })
      } else {
        setQuestionFormData({
          skillType: fullQuestion.data.skillType,
          questionType: fullQuestion.data.questionType,
          textContent: fullQuestion.data.textContent,
          audioFileUrl: fullQuestion.data.audioFileUrl || '',
          readingPassage: fullQuestion.data.readingPassage || '',
          scorePoints: fullQuestion.data.scorePoints,
          correctAnswerText: fullQuestion.data.correctAnswerText || '',
          difficultyLevel: fullQuestion.data.difficultyLevel,
          orderIndex: fullQuestion.data.orderIndex,
          options: []
        })
      }
      setShowQuestionForm(true)
    } catch (error) {
      console.error('Error fetching question:', error)
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }
    
    try {
      await api.post(`/assessments/templates/${templateName}`)
      alert(`Template "${templateName}" created successfully!`)
      setTemplateName('')
      fetchQuestions()
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Error creating template. Please try again.')
    }
  }

  const resetQuestionForm = () => {
    setQuestionFormData({
      skillType: 'LISTENING',
      questionType: 'MULTIPLE_CHOICE',
      textContent: '',
      audioFileUrl: '',
      readingPassage: '',
      scorePoints: 20.0,
      correctAnswerText: '',
      difficultyLevel: 'INTERMEDIATE',
      orderIndex: 1,
      options: [{ optionText: '', isCorrect: false, orderIndex: 1 }]
    })
  }

  // Auto-set question type based on skill type
  const handleSkillTypeChange = (skillType) => {
    let questionType = 'MULTIPLE_CHOICE'
    let options = [{ optionText: '', isCorrect: false, orderIndex: 1 }]
    
    switch(skillType) {
      case 'LISTENING':
        questionType = 'MULTIPLE_CHOICE'
        options = [{ optionText: '', isCorrect: false, orderIndex: 1 }]
        break
      case 'READING':
        questionType = 'MULTIPLE_CHOICE'
        options = [{ optionText: '', isCorrect: false, orderIndex: 1 }]
        break
      case 'WRITING':
        questionType = 'TEXT_INPUT'
        options = []
        break
      case 'SPEAKING':
        questionType = 'TEXT_INPUT' // Prompt for speaking
        options = []
        break
      case 'GRAMMAR':
        questionType = 'MULTIPLE_CHOICE'
        options = [{ optionText: '', isCorrect: false, orderIndex: 1 }]
        break
      case 'VOCABULARY':
        questionType = 'MULTIPLE_CHOICE'
        options = [{ optionText: '', isCorrect: false, orderIndex: 1 }]
        break
    }
    
    setQuestionFormData({
      ...questionFormData,
      skillType,
      questionType,
      options,
      audioFileUrl: skillType === 'LISTENING' ? questionFormData.audioFileUrl : '',
      readingPassage: skillType === 'READING' ? questionFormData.readingPassage : ''
    })
  }

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return
    }

    try {
      setUploadingAudio(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/files/upload/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const audioUrl = `http://localhost:8080${response.data.url}`
      setQuestionFormData(prev => ({ ...prev, audioFileUrl: audioUrl }))
      alert('Audio uploaded successfully!')
    } catch (error) {
      console.error('Error uploading audio:', error)
      alert('Error uploading audio. Please try again.')
    } finally {
      setUploadingAudio(false)
    }
  }

  const addOption = () => {
    setQuestionFormData({
      ...questionFormData,
      options: [...questionFormData.options, { optionText: '', isCorrect: false, orderIndex: questionFormData.options.length + 1 }]
    })
  }

  const removeOption = (index) => {
    setQuestionFormData({
      ...questionFormData,
      options: questionFormData.options.filter((_, i) => i !== index)
    })
  }

  const updateOption = (index, field, value) => {
    const newOptions = [...questionFormData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setQuestionFormData({ ...questionFormData, options: newOptions })
  }

  const getLevelColor = (level) => {
    const colors = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'ELEMENTARY': 'bg-blue-100 text-blue-800',
      'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
      'UPPER_INTERMEDIATE': 'bg-orange-100 text-orange-800',
      'ADVANCED': 'bg-red-100 text-red-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
        <p className="text-gray-600 mt-2">Manage assessments, questions, and templates</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assessments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ClipboardList className="w-5 h-5 inline mr-2" />
            User Assessments
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'questions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Questions
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Templates
          </button>
        </nav>
      </div>

      {/* Assessments Tab */}
      {activeTab === 'assessments' && (
        <>
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by User
        </label>
        <select
          value={selectedUser || ''}
          onChange={(e) => setSelectedUser(e.target.value || null)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {selectedUser ? 'No assessments found for this user' : 'Select a user to view assessments'}
                  </td>
                </tr>
              ) : (
                assessments.map((assessment) => (
                  <tr key={assessment.assessmentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.user?.username || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assessment.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assessment.overallLevel ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(assessment.overallLevel)}`}>
                          {assessment.overallLevel}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not completed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assessment.overallScore ? assessment.overallScore.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Listening: {assessment.listeningScore?.toFixed(1) || 'N/A'}</div>
                        <div>Reading: {assessment.readingScore?.toFixed(1) || 'N/A'}</div>
                        <div>Writing: {assessment.writingScore?.toFixed(1) || 'N/A'}</div>
                        <div>Speaking: {assessment.speakingScore?.toFixed(1) || 'N/A'}</div>
                        <div>Grammar: {assessment.grammarScore?.toFixed(1) || 'N/A'}</div>
                        <div>Vocabulary: {assessment.vocabularyScore?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assessment.completedAt 
                        ? new Date(assessment.completedAt).toLocaleDateString()
                        : 'Incomplete'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          alert(`Assessment Details:\nOverall Level: ${assessment.overallLevel}\nOverall Score: ${assessment.overallScore}`)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">All Skills</option>
                <option value="LISTENING">Listening</option>
                <option value="READING">Reading</option>
                <option value="WRITING">Writing</option>
                <option value="SPEAKING">Speaking</option>
                <option value="GRAMMAR">Grammar</option>
                <option value="VOCABULARY">Vocabulary</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingQuestion(null)
                resetQuestionForm()
                setShowQuestionForm(true)
              }}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>

          {showQuestionForm && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </h2>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Type *</label>
                    <select
                      value={questionFormData.skillType}
                      onChange={(e) => handleSkillTypeChange(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="LISTENING">🎧 Listening (Nghe và chọn đáp án)</option>
                      <option value="READING">📖 Reading (Đọc đoạn văn và chọn đáp án)</option>
                      <option value="WRITING">✍️ Writing (Điền đáp án)</option>
                      <option value="SPEAKING">🎤 Speaking (Ghi âm hoặc upload audio)</option>
                      <option value="GRAMMAR">📝 Grammar (Chọn đáp án ngữ pháp)</option>
                      <option value="VOCABULARY">📚 Vocabulary (Chọn đáp án từ vựng)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {questionFormData.skillType === 'LISTENING' && 'Cần upload audio file để người dùng nghe'}
                      {questionFormData.skillType === 'READING' && 'Cần nhập đoạn văn để người dùng đọc'}
                      {questionFormData.skillType === 'WRITING' && 'Người dùng sẽ điền đáp án dạng text'}
                      {questionFormData.skillType === 'SPEAKING' && 'Người dùng sẽ ghi âm hoặc upload audio, AI sẽ chấm điểm'}
                      {questionFormData.skillType === 'GRAMMAR' && 'Câu hỏi trắc nghiệm về ngữ pháp'}
                      {questionFormData.skillType === 'VOCABULARY' && 'Câu hỏi trắc nghiệm về từ vựng'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type *</label>
                    <select
                      value={questionFormData.questionType}
                      onChange={(e) => {
                        const newType = e.target.value
                        setQuestionFormData({
                          ...questionFormData,
                          questionType: newType,
                          options: newType === 'MULTIPLE_CHOICE' 
                            ? [{ optionText: '', isCorrect: false, orderIndex: 1 }]
                            : []
                        })
                      }}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                      disabled={['WRITING', 'SPEAKING'].includes(questionFormData.skillType)}
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TEXT_INPUT">Text Input</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="FILL_BLANK">Fill in the Blank</option>
                    </select>
                    {['WRITING', 'SPEAKING'].includes(questionFormData.skillType) && (
                      <p className="text-xs text-gray-500 mt-1">Tự động set thành Text Input cho {questionFormData.skillType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                    <select
                      value={questionFormData.difficultyLevel}
                      onChange={(e) => setQuestionFormData({...questionFormData, difficultyLevel: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="ELEMENTARY">Elementary</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="UPPER_INTERMEDIATE">Upper Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score Points</label>
                    <input
                      type="number"
                      value={questionFormData.scorePoints}
                      onChange={(e) => setQuestionFormData({...questionFormData, scorePoints: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Index</label>
                    <input
                      type="number"
                      value={questionFormData.orderIndex}
                      onChange={(e) => setQuestionFormData({...questionFormData, orderIndex: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border rounded-lg"
                      min="1"
                    />
                  </div>
                </div>
                {/* Reading Passage for READING questions */}
                {questionFormData.skillType === 'READING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reading Passage (Đoạn văn) *
                    </label>
                    <textarea
                      value={questionFormData.readingPassage}
                      onChange={(e) => setQuestionFormData({...questionFormData, readingPassage: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows="6"
                      placeholder="Nhập đoạn văn để người dùng đọc..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Đoạn văn này sẽ hiển thị trước câu hỏi</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {questionFormData.skillType === 'READING' ? 'Question Text (Câu hỏi về đoạn văn) *' : 'Question Text *'}
                  </label>
                  <textarea
                    value={questionFormData.textContent}
                    onChange={(e) => setQuestionFormData({...questionFormData, textContent: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder={
                      questionFormData.skillType === 'LISTENING' ? 'Ví dụ: What time does the meeting start?'
                      : questionFormData.skillType === 'READING' ? 'Ví dụ: What is the main idea of the passage?'
                      : questionFormData.skillType === 'WRITING' ? 'Ví dụ: Write a paragraph about your favorite hobby'
                      : questionFormData.skillType === 'SPEAKING' ? 'Ví dụ: Describe your hometown in 2 minutes'
                      : questionFormData.skillType === 'GRAMMAR' ? 'Ví dụ: Choose the correct form of the verb'
                      : 'Ví dụ: What does this word mean?'
                    }
                    required
                  />
                </div>
                {questionFormData.skillType === 'LISTENING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audio File (for LISTENING questions)
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingAudio ? 'Uploading...' : 'Upload Audio'}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                          disabled={uploadingAudio}
                        />
                      </label>
                      {questionFormData.audioFileUrl && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">✓ Audio uploaded</span>
                          <audio controls src={questionFormData.audioFileUrl} className="h-8" />
                        </div>
                      )}
                    </div>
                    {questionFormData.audioFileUrl && (
                      <input
                        type="text"
                        value={questionFormData.audioFileUrl}
                        onChange={(e) => setQuestionFormData({...questionFormData, audioFileUrl: e.target.value})}
                        className="w-full mt-2 px-4 py-2 border rounded-lg text-sm"
                        placeholder="Or enter audio URL directly"
                      />
                    )}
                  </div>
                )}
                {questionFormData.questionType !== 'MULTIPLE_CHOICE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                    <input
                      type="text"
                      value={questionFormData.correctAnswerText}
                      onChange={(e) => setQuestionFormData({...questionFormData, correctAnswerText: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                )}
                {questionFormData.questionType === 'MULTIPLE_CHOICE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                    {questionFormData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-4 py-2 border rounded-lg"
                          required
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Correct</span>
                        </label>
                        {questionFormData.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 text-primary-600 hover:text-primary-900 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                  >
                    {editingQuestion ? 'Update Question' : 'Create Question'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setEditingQuestion(null)
                      resetQuestionForm()
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No questions found
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.questionId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {question.skillType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.questionType}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate">
                            {question.textContent}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {question.scorePoints}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.questionId)}
                              className="text-red-600 hover:text-red-900"
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
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create Assessment Template</h2>
          <p className="text-gray-600 mb-4">
            Create a preset assessment template with sample questions for all 6 skills (5 questions per skill).
          </p>
          <div className="flex space-x-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name (e.g., 'Standard Assessment')"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleCreateTemplate}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Create Template
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
