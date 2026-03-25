import { useState, useEffect } from 'react'
import api from '../api/axios'
import { BookOpen, Plus, Edit, Trash2, Eye, FileText, Video, Music, Image, File, ChevronRight, ChevronDown, Upload } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function LessonManagement() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [subLessons, setSubLessons] = useState([])
  const [showSubLessonModal, setShowSubLessonModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [editorTempContent, setEditorTempContent] = useState('')
  const [selectedSubLesson, setSelectedSubLesson] = useState(null)
  const [materials, setMaterials] = useState([])
  const [exercises, setExercises] = useState([])
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    lessonType: 'GRAMMAR',
    level: 'BEGINNER',
    description: '',
    content: '',
    estimatedDurationMinutes: 15,
    xpReward: 10,
    difficultyLevel: 'EASY',
    orderIndex: 1,
    isActive: true
  })

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await api.get('/lessons')
      setLessons(response.data)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingLesson) {
        await api.put(`/lessons/${editingLesson.lessonId}`, formData)
      } else {
        await api.post('/lessons', formData)
      }
      setShowForm(false)
      setEditingLesson(null)
      resetForm()
      fetchLessons()
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Error saving lesson. Please try again.')
    }
  }

  const handleDelete = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return

    try {
      await api.delete(`/lessons/${lessonId}`)
      fetchLessons()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Error deleting lesson. Please try again.')
    }
  }

  const handleEdit = (lesson) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title || '',
      lessonType: lesson.lessonType || 'GRAMMAR',
      level: lesson.level || 'BEGINNER',
      description: lesson.description || '',
      content: lesson.content || '',
      estimatedDurationMinutes: lesson.estimatedDurationMinutes || 15,
      xpReward: lesson.xpReward || 10,
      difficultyLevel: lesson.difficultyLevel || 'EASY',
      orderIndex: lesson.orderIndex || 1,
      isActive: lesson.isActive !== false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      lessonType: 'GRAMMAR',
      level: 'BEGINNER',
      description: '',
      content: '',
      estimatedDurationMinutes: 15,
      xpReward: 10,
      difficultyLevel: 'EASY',
      orderIndex: 1,
      isActive: true
    })
  }

  const [subLessonFormData, setSubLessonFormData] = useState({
    title: '',
    content: '',
    orderIndex: 1
  })

  const [materialFormData, setMaterialFormData] = useState({
    materialType: 'TEXT',
    title: '',
    content: '',
    fileUrl: '',
    orderIndex: 1
  })

  const [exerciseFormData, setExerciseFormData] = useState({
    exerciseType: 'MULTIPLE_CHOICE',
    title: '',
    questionText: '',
    correctAnswer: '',
    scorePoints: 10.0,
    orderIndex: 1,
    options: [{ optionText: '', isCorrect: false, orderIndex: 1 }]
  })

  const handleManageLesson = async (lesson) => {
    setSelectedLesson(lesson)
    await fetchSubLessons(lesson.lessonId)
    setShowSubLessonModal(true)
  }

  const fetchSubLessons = async (lessonId) => {
    try {
      const response = await api.get(`/lessons/${lessonId}/sub-lessons`)
      setSubLessons(response.data)
    } catch (error) {
      console.error('Error fetching sub-lessons:', error)
      setSubLessons([])
    }
  }

  const handleCreateSubLesson = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/lessons/${selectedLesson.lessonId}/sub-lessons`, subLessonFormData)
      await fetchSubLessons(selectedLesson.lessonId)
      setSubLessonFormData({ title: '', content: '', orderIndex: subLessons.length + 1 })
    } catch (error) {
      console.error('Error creating sub-lesson:', error)
      alert('Error creating sub-lesson')
    }
  }

  const [isLoadingContent, setIsLoadingContent] = useState(false)

  const handleManageSubLesson = async (subLesson) => {
    console.log('Opening manage content for sub-lesson:', subLesson)

    try {
      setIsLoadingContent(true)
      setError(null)

      // Clear previous state first
      setMaterials([])
      setExercises([])

      setSelectedSubLesson(subLesson)

      // Reset forms to clean state
      setShowMaterialForm(false)
      setShowExerciseForm(false)
      setEditingMaterial(null)

      setExerciseFormData({
        exerciseType: 'MULTIPLE_CHOICE',
        title: '',
        questionText: '',
        correctAnswer: '',
        scorePoints: 10.0,
        orderIndex: 1,
        options: [{ optionText: '', isCorrect: false, orderIndex: 1 }]
      })

      setMaterialFormData({
        materialType: 'TEXT',
        title: '',
        content: '',
        fileUrl: '',
        orderIndex: 1
      })

      // Fetch data with error handling
      console.log('Fetching materials and exercises for subLessonId:', subLesson.subLessonId)

      try {
        await fetchMaterials(subLesson.subLessonId)
      } catch (err) {
        console.error('Error fetching materials:', err)
        setMaterials([])
      }

      try {
        await fetchExercises(subLesson.subLessonId)
      } catch (err) {
        console.error('Error fetching exercises:', err)
        setExercises([])
      }

      console.log('Materials loaded:', materials.length)
      console.log('Exercises loaded:', exercises.length)

      setShowSubLessonModal(false)
      setShowContentModal(true)
    } catch (error) {
      console.error('Error managing sub-lesson:', error)
      console.error('Error details:', error.message, error.stack)
      setError('Error loading sub-lesson content: ' + error.message)
      alert('Error loading sub-lesson content: ' + error.message)
      setIsLoadingContent(false)
    } finally {
      setIsLoadingContent(false)
    }
  }

  const [editingMaterial, setEditingMaterial] = useState(null)
  const [editingExercise, setEditingExercise] = useState(null)

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    
    // Create the material object without the file property
    const { file, ...materialData } = materialFormData
    
    // Append the material data as a JSON string
    formData.append('material', JSON.stringify(materialData))

    // Append the file if it exists
    if (file) {
      formData.append('file', file)
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      if (editingMaterial) {
        await api.put(`/sub-lessons/materials/${editingMaterial.materialId}`, formData, config)
      } else {
        await api.post(`/sub-lessons/${selectedSubLesson.subLessonId}/materials`, formData, config)
      }
      
      await fetchMaterials(selectedSubLesson.subLessonId)
      setMaterialFormData({ materialType: 'TEXT', title: '', content: '', fileUrl: '', orderIndex: materials.length + 1 })
      setEditingMaterial(null)
      setShowMaterialForm(false)
    } catch (error) {
      console.error('Error saving material:', error)
      alert('Error saving material. ' + (error.response?.data?.message || ''))
    }
  }

  const handleEditMaterial = (material) => {
    setEditingMaterial(material)
    setMaterialFormData({
      materialType: material.materialType,
      title: material.title,
      content: material.content || '',
      fileUrl: material.fileUrl || '',
      orderIndex: material.orderIndex || 1
    })
    setShowMaterialForm(true)
  }

  const handleCreateExercise = async (e) => {
    e.preventDefault()

    // Validate form data
    if (!exerciseFormData.title || !exerciseFormData.questionText) {
      alert('Please fill in all required fields (Title and Question Text)')
      return
    }

    // Validate options for multiple choice
    if (exerciseFormData.exerciseType === 'MULTIPLE_CHOICE') {
      if (!exerciseFormData.options || exerciseFormData.options.length === 0) {
        alert('Please add at least one option for multiple choice questions')
        return
      }

      const hasCorrectAnswer = exerciseFormData.options.some(opt => opt.isCorrect)
      if (!hasCorrectAnswer) {
        alert('Please mark at least one option as correct')
        return
      }

      const hasEmptyOption = exerciseFormData.options.some(opt => !opt.optionText || opt.optionText.trim() === '')
      if (hasEmptyOption) {
        alert('Please fill in all option texts')
        return
      }
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...exerciseFormData,
        scorePoints: parseFloat(exerciseFormData.scorePoints) || 10.0,
        orderIndex: parseInt(exerciseFormData.orderIndex) || 1
      }

      console.log('Submitting exercise data:', submitData)

      let response;
      if (editingExercise) {
        response = await api.put(`/sub-lessons/exercises/${editingExercise.exerciseId}`, submitData)
      } else {
        response = await api.post(`/sub-lessons/${selectedSubLesson.subLessonId}/exercises`, submitData)
      }

      console.log('Exercise saved successfully:', response.data)

      // Update local state
      if (editingExercise) {
        setExercises(prevExercises =>
          prevExercises.map(ex => ex.exerciseId === editingExercise.exerciseId ? response.data : ex)
        )
      } else {
        const newExercise = response.data
        setExercises(prevExercises => [...prevExercises, newExercise])
      }

      setEditingExercise(null)
      setShowExerciseForm(false)

      // Reset form
      setExerciseFormData({
        exerciseType: 'MULTIPLE_CHOICE',
        title: '',
        questionText: '',
        correctAnswer: '',
        scorePoints: 10.0,
        orderIndex: exercises.length + 1,
        options: [{ optionText: '', isCorrect: false, orderIndex: 1 }]
      })

      alert(editingExercise ? 'Exercise updated successfully!' : 'Exercise created successfully!')
    } catch (error) {
      console.error('Error creating exercise:', error)
      console.error('Error response:', error.response?.data)

      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
      alert(`Error creating exercise: ${errorMessage}`)
    }
  }

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise)
    setExerciseFormData({
      exerciseType: exercise.exerciseType || 'MULTIPLE_CHOICE',
      title: exercise.title || '',
      questionText: exercise.questionText || '',
      correctAnswer: exercise.correctAnswer || '',
      scorePoints: exercise.scorePoints || 10.0,
      orderIndex: exercise.orderIndex || 1,
      options: exercise.options ? exercise.options.map(opt => ({
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
        orderIndex: opt.orderIndex
      })) : [{ optionText: '', isCorrect: false, orderIndex: 1 }]
    })
    setShowExerciseForm(true)
  }

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return
    try {
      await api.delete(`/sub-lessons/materials/${materialId}`)
      await fetchMaterials(selectedSubLesson.subLessonId)
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Error deleting material')
    }
  }

  const handleDeleteExercise = async (exerciseId) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return
    try {
      await api.delete(`/sub-lessons/exercises/${exerciseId}`)
      await fetchExercises(selectedSubLesson.subLessonId)
    } catch (error) {
      console.error('Error deleting exercise:', error)
      alert('Error deleting exercise')
    }
  }

  const fetchMaterials = async (subLessonId) => {
    try {
      console.log('Fetching materials for subLessonId:', subLessonId)
      const response = await api.get(`/sub-lessons/${subLessonId}/materials`)
      console.log('Materials response:', response.data)

      // Validate response data
      if (Array.isArray(response.data)) {
        setMaterials(response.data)
      } else {
        console.warn('Materials response is not an array:', response.data)
        setMaterials([])
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
      console.error('Error response:', error.response?.data)
      setMaterials([])
    }
  }

  const fetchExercises = async (subLessonId) => {
    try {
      console.log('Fetching exercises for subLessonId:', subLessonId)
      const response = await api.get(`/sub-lessons/${subLessonId}/exercises`)
      console.log('Exercises response:', response.data)

      // Validate response data
      if (Array.isArray(response.data)) {
        setExercises(response.data)
      } else {
        console.warn('Exercises response is not an array:', response.data)
        setExercises([])
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
      console.error('Error response:', error.response?.data)
      setExercises([])
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading lessons...</div>
  }

  return (
    <>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lesson Management</h1>
          <p className="text-gray-600 mt-2">Manage lessons for the platform</p>
        </div>
        <button
          onClick={() => {
            setEditingLesson(null)
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Lesson</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
              </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type *</label>
                <select
                  value={formData.lessonType}
                  onChange={(e) => setFormData({ ...formData, lessonType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="GRAMMAR">Grammar</option>
                  <option value="VOCABULARY">Vocabulary</option>
                  <option value="LISTENING">Listening</option>
                  <option value="READING">Reading</option>
                  <option value="WRITING">Writing</option>
                  <option value="SPEAKING">Speaking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="ELEMENTARY">Elementary</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="UPPER_INTERMEDIATE">Upper Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                <input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="6"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                {editingLesson ? 'Update Lesson' : 'Create Lesson'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingLesson(null)
                  resetForm()
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessons.map((lesson, index) => (
                <tr key={lesson.lessonId || `lesson-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-500">{lesson.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {lesson.lessonType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lesson.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lesson.xpReward} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${lesson.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {lesson.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleManageLesson(lesson)}
                        className="text-green-600 hover:text-green-900"
                        title="Manage Sub-Lessons"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.lessonId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-Lesson Management Modal */}
      {showSubLessonModal && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Sub-Lessons: {selectedLesson.title}
              </h2>
              <button
                onClick={() => {
                  setShowSubLessonModal(false)
                  setSelectedLesson(null)
                  setSubLessons([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubLesson} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Add New Sub-Lesson</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Sub-Lesson Title"
                  value={subLessonFormData.title}
                  onChange={(e) => setSubLessonFormData({ ...subLessonFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <textarea
                  placeholder="Content"
                  value={subLessonFormData.content}
                  onChange={(e) => setSubLessonFormData({ ...subLessonFormData, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Order Index"
                    value={subLessonFormData.orderIndex}
                    onChange={(e) => setSubLessonFormData({ ...subLessonFormData, orderIndex: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="1"
                  />
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              {subLessons.map((subLesson, index) => (
                <div key={subLesson.subLessonId || `sublesson-${index}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{subLesson.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{subLesson.content?.substring(0, 100)}...</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleManageSubLesson(subLesson)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Manage Content
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Materials & Exercises Management Modal */}
      {showContentModal && selectedSubLesson && (
        <div key={selectedSubLesson.subLessonId} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Content: {selectedSubLesson?.title || 'Loading...'}
              </h2>
              <button
                onClick={() => {
                  setShowContentModal(false)
                  setSelectedSubLesson(null)
                  setMaterials([])
                  setExercises([])
                  setShowMaterialForm(false)
                  setShowExerciseForm(false)
                  setShowSubLessonModal(true)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">Error:</p>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {isLoadingContent ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading content...</p>
              </div>
            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                {/* Materials Section */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Materials
                    </h3>
                    <button
                      onClick={() => {
                        setEditingMaterial(null)
                        setMaterialFormData({ materialType: 'TEXT', title: '', content: '', fileUrl: '', orderIndex: materials.length + 1 })
                        setShowMaterialForm(true)
                      }}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Material
                    </button>
                  </div>

                  {showMaterialForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                          <h4 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            {editingMaterial ? 'Edit Material' : 'Create New Material'}
                          </h4>
                          <button 
                            onClick={() => setShowMaterialForm(false)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Plus className="w-6 h-6 transform rotate-45 text-gray-500" />
                          </button>
                        </div>

                        <form onSubmit={handleCreateMaterial} className="flex-1 overflow-y-auto p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Material Type</label>
                              <select
                                value={materialFormData.materialType}
                                onChange={(e) => setMaterialFormData({ ...materialFormData, materialType: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
                                required
                              >
                                <option value="TEXT">Text Content</option>
                                <option value="VIDEO">Video Lesson</option>
                                <option value="AUDIO">Audio File</option>
                                <option value="PDF">PDF Document</option>
                                <option value="IMAGE">Image / Diagram</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Display Order</label>
                              <input
                                type="number"
                                value={materialFormData.orderIndex}
                                onChange={(e) => setMaterialFormData({ ...materialFormData, orderIndex: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all"
                                min="1"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                              Material Title
                            </label>
                            <input
                              type="text"
                              placeholder="E.G. GRAMMAR BASICS: PRESENT SIMPLE"
                              value={materialFormData.title}
                              onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-bold uppercase focus:border-blue-500 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <p className="mt-1 text-xs text-gray-400 italic">* Title will be automatically displayed in BOLD and UPPERCASE for students.</p>
                          </div>

                          {materialFormData.materialType !== 'TEXT' && (
                            <div className="p-5 bg-blue-50 border-2 border-blue-100 rounded-xl space-y-4">
                              <label className="block text-sm font-bold text-blue-800 uppercase tracking-wider">File & Media</label>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-md active:transform active:scale-95">
                                  <Upload className="w-5 h-4 mr-2" />
                                  <span className="font-bold">UPLOAD FILE</span>
                                  <input
                                    type="file"
                                    onChange={(e) => setMaterialFormData({ ...materialFormData, file: e.target.files[0] })}
                                    className="hidden"
                                  />
                                </label>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-blue-900 truncate">
                                    {materialFormData.file ? materialFormData.file.name : (materialFormData.fileUrl ? 'Existing file attached' : 'No file chosen')}
                                  </p>
                                  {materialFormData.file && <p className="text-xs text-blue-600">{(materialFormData.file.size / 1024 / 1024).toFixed(2)} MB</p>}
                                </div>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-400 text-sm font-bold">URL:</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="https://example.com/media-file.mp4"
                                  value={materialFormData.fileUrl}
                                  onChange={(e) => setMaterialFormData({ ...materialFormData, fileUrl: e.target.value })}
                                  className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex-1 flex flex-col min-h-[300px]">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Detailed Content / Description
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditorTempContent(materialFormData.content || '')
                                  setShowEditorModal(true)
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-all font-bold text-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                FULL SCREEN EDITOR
                              </button>
                            </div>
                            <div 
                              onClick={() => {
                                setEditorTempContent(materialFormData.content || '')
                                setShowEditorModal(true)
                              }}
                              className="flex-1 bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-all overflow-y-auto max-h-[200px]"
                            >
                              {materialFormData.content ? (
                                <div className="prose prose-sm max-w-none ql-editor" dangerouslySetInnerHTML={{ __html: materialFormData.content }} />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 italic">
                                  Click to open editor and write content...
                                </div>
                              )}
                            </div>
                          </div>

                          {materialFormData.materialType === 'VIDEO' && materialFormData.fileUrl && (
                            <div className="mt-4 p-4 bg-gray-900 rounded-xl">
                              <p className="text-xs text-gray-400 mb-3 font-bold uppercase tracking-widest">Live Preview</p>
                              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                                <iframe
                                  src={(() => {
                                    const url = materialFormData.fileUrl;
                                    if (url.includes('youtube.com/watch?v=')) {
                                      return url.replace('watch?v=', 'embed/');
                                    } else if (url.includes('youtu.be/')) {
                                      return url.replace('youtu.be/', 'www.youtube.com/embed/');
                                    }
                                    return url;
                                  })()}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          )}
                        </form>

                        <div className="p-4 border-t bg-gray-50 flex gap-4">
                          <button
                            onClick={handleCreateMaterial}
                            className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-black text-lg transition-all shadow-lg active:transform active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-6 h-6" />
                            {editingMaterial ? 'UPDATE MATERIAL' : 'CREATE MATERIAL'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMaterial(null)
                              setMaterialFormData({ materialType: 'TEXT', title: '', content: '', fileUrl: '', orderIndex: materials.length + 1 })
                              setShowMaterialForm(false)
                            }}
                            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold transition-all"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {materials && materials.length > 0 ? (
                      materials.map((material, index) => (
                        <div key={material.materialId || `material-${index}`} className="border rounded-lg p-3 flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {material.materialType === 'VIDEO' && <Video className="w-4 h-4 text-red-500" />}
                              {material.materialType === 'AUDIO' && <Music className="w-4 h-4 text-blue-500" />}
                              {material.materialType === 'IMAGE' && <Image className="w-4 h-4 text-green-500" />}
                              {material.materialType === 'PDF' && <File className="w-4 h-4 text-purple-500" />}
                              {material.materialType === 'TEXT' && <FileText className="w-4 h-4 text-gray-500" />}
                              <span className="font-bold uppercase text-gray-800">{material.title || 'Untitled'}</span>
                              <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600 uppercase font-bold tracking-tight">
                                {material.materialType || 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">
                              {material.content ? stripHtml(material.content).substring(0, 100) + '...' : 'No content'}
                            </p>

                            {/* Video Preview in List */}
                            {material.materialType === 'VIDEO' && material.fileUrl && (
                              <div className="mt-2 max-w-sm">
                                <iframe
                                  src={(() => {
                                    const url = material.fileUrl;
                                    if (url.includes('youtube.com/watch?v=')) {
                                      return url.replace('watch?v=', 'embed/');
                                    } else if (url.includes('youtu.be/')) {
                                      return url.replace('youtu.be/', 'www.youtube.com/embed/');
                                    }
                                    return url;
                                  })()}
                                  className="w-full h-32 rounded-lg border"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleEditMaterial(material)}
                              className="text-blue-600 hover:text-blue-900 ml-2"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(material.materialId)}
                              className="text-red-600 hover:text-red-900 ml-2"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No materials yet</p>
                    )}
                  </div>
                </div>

                {/* Exercises Section */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Exercises
                    </h3>
                    <button
                      onClick={() => {
                        if (showExerciseForm) {
                          setEditingExercise(null)
                        }
                        setShowExerciseForm(!showExerciseForm)
                      }}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      {showExerciseForm ? 'Cancel' : '+ Add Exercise'}
                    </button>
                  </div>

                  {showExerciseForm && (
                    <form onSubmit={handleCreateExercise} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">{editingExercise ? 'Edit Exercise' : 'Add New Exercise'}</h4>
                      <div className="space-y-3">
                        <select
                          value={exerciseFormData.exerciseType}
                          onChange={(e) => {
                            const newType = e.target.value
                            setExerciseFormData({
                              ...exerciseFormData,
                              exerciseType: newType,
                              options: newType === 'MULTIPLE_CHOICE' ? [{ optionText: '', isCorrect: false, orderIndex: 1 }] : []
                            })
                          }}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        >
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="FILL_BLANK">Fill Blank</option>
                          <option value="TEXT_INPUT">Text Input</option>
                          <option value="MATCHING">Matching</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Title"
                          value={exerciseFormData.title}
                          onChange={(e) => setExerciseFormData({ ...exerciseFormData, title: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          required
                        />
                        <textarea
                          placeholder="Question Text"
                          value={exerciseFormData.questionText}
                          onChange={(e) => setExerciseFormData({ ...exerciseFormData, questionText: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                          rows="3"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Correct Answer"
                          value={exerciseFormData.correctAnswer}
                          onChange={(e) => setExerciseFormData({ ...exerciseFormData, correctAnswer: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Score Points (Điểm số cho bài tập này)
                            </label>
                            <input
                              type="number"
                              placeholder="10"
                              value={exerciseFormData.scorePoints}
                              onChange={(e) => setExerciseFormData({ ...exerciseFormData, scorePoints: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border rounded-lg"
                              step="0.1"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Order Index (Thứ tự hiển thị của bài tập)
                            </label>
                            <input
                              type="number"
                              placeholder="1"
                              value={exerciseFormData.orderIndex}
                              onChange={(e) => setExerciseFormData({ ...exerciseFormData, orderIndex: parseInt(e.target.value) })}
                              className="w-full px-4 py-2 border rounded-lg"
                              min="1"
                            />
                          </div>
                        </div>
                        {exerciseFormData.exerciseType === 'MULTIPLE_CHOICE' && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">Options:</label>
                            {exerciseFormData.options?.map((option, idx) => (
                              <div key={idx} className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Option text"
                                  value={option.optionText}
                                  onChange={(e) => {
                                    const newOptions = [...(exerciseFormData.options || [])]
                                    newOptions[idx].optionText = e.target.value
                                    setExerciseFormData({ ...exerciseFormData, options: newOptions })
                                  }}
                                  className="flex-1 px-4 py-2 border rounded-lg"
                                />
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) => {
                                      const newOptions = [...(exerciseFormData.options || [])]
                                      newOptions[idx].isCorrect = e.target.checked
                                      setExerciseFormData({ ...exerciseFormData, options: newOptions })
                                    }}
                                    className="rounded"
                                  />
                                  <span className="ml-1 text-sm">Correct</span>
                                </label>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const currentOptions = exerciseFormData.options || []
                                setExerciseFormData({
                                  ...exerciseFormData,
                                  options: [...currentOptions, { optionText: '', isCorrect: false, orderIndex: currentOptions.length + 1 }]
                                })
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}
                        <button type="submit" className="btn btn-primary w-full">
                          {editingExercise ? 'Update Exercise' : 'Add Exercise'}
                        </button>
                        {editingExercise && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExercise(null)
                              setShowExerciseForm(false)
                              setExerciseFormData({
                                exerciseType: 'MULTIPLE_CHOICE',
                                title: '',
                                questionText: '',
                                correctAnswer: '',
                                scorePoints: 10.0,
                                orderIndex: exercises.length + 1,
                                options: [{ optionText: '', isCorrect: false, orderIndex: 1 }]
                              })
                            }}
                            className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 w-full mt-2"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {exercises && exercises.length > 0 ? (
                      exercises.map((exercise, index) => (
                        <div key={exercise.exerciseId || `exercise-${index}`} className="border rounded-lg p-3 flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{exercise.title || 'Untitled'}</span>
                              <span className="text-xs text-gray-500">({exercise.exerciseType || 'N/A'})</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {exercise.questionText ? exercise.questionText.substring(0, 50) + '...' : 'No question text'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Score: {exercise.scorePoints || 0} pts</p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleEditExercise(exercise)}
                              className="text-blue-600 hover:text-blue-900 ml-2"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExercise(exercise.exerciseId)}
                              className="text-red-600 hover:text-red-900 ml-2"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No exercises yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* DEDICATED FULL SCREEN CONTENT EDITOR (WORD-LIKE) */}
    {showEditorModal && (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Editor Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Content Editor</h2>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Microsoft Word Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditorModal(false)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all text-sm"
            >
              DISCARD CHANGES
            </button>
            <button
              onClick={() => {
                setMaterialFormData({ ...materialFormData, content: editorTempContent })
                setShowEditorModal(false)
              }}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all shadow-lg active:transform active:scale-95 text-sm"
            >
              APPLY TO MATERIAL
            </button>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center">
          {/* The "Paper" */}
          <div className="bg-white w-full max-w-4xl shadow-2xl min-h-[1056px] p-12 flex flex-col border border-gray-300">
            <div className="mb-8 border-b-2 border-gray-100 pb-4">
              <h1 className="text-gray-300 text-4xl font-black uppercase pointer-events-none select-none">
                {materialFormData.title || 'Untitled Document'}
              </h1>
            </div>
            
            <div className="flex-1">
              <ReactQuill
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'font': [] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean'],
                    ['blockquote', 'code-block']
                  ],
                }}
                value={editorTempContent}
                onChange={setEditorTempContent}
                className="h-full min-h-[800px] quill-word-editor"
                placeholder="Start typing your amazing lesson content here..."
              />
            </div>
          </div>
        </div>

        {/* Editor Footer Status Bar */}
        <div className="bg-gray-100 border-t p-2 px-6 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex gap-4">
            <span>Status: Editing</span>
            <span>Mode: Rich Text (HTML)</span>
          </div>
          <div>
            <span>English Learning Platform Admin v1.0</span>
          </div>
        </div>
      </div>
    )}

    <style>{`
      .quill-word-editor .ql-container {
        font-size: 16px;
        border: none !important;
      }
      .quill-word-editor .ql-toolbar {
        border: none !important;
        border-bottom: 2px solid #f3f4f6 !important;
        padding: 12px !important;
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
      }
      .quill-word-editor .ql-editor {
        min-height: 800px;
        padding: 0 !important;
      }
    `}</style>
  </>
  )
}
