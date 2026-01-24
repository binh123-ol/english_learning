import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Clock, CheckCircle, Play } from 'lucide-react'

export default function LessonDetail() {
  const { lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const [subLessons, setSubLessons] = useState([])
  const [subLessonMaterials, setSubLessonMaterials] = useState({})
  const [subLessonExercises, setSubLessonExercises] = useState({})

  const [viewedMaterials, setViewedMaterials] = useState(new Set())
  const [userAnswers, setUserAnswers] = useState({})
  const [showExercises, setShowExercises] = useState(false)
  const [isExercisesUnlocked, setIsExercisesUnlocked] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchLessonAndDetails()
    fetchProgress()
  }, [lessonId, user])

  const fetchLessonAndDetails = async () => {
    try {
      console.log('Fetching lesson details for lessonId:', lessonId)
      const response = await axios.get(`/lessons/${lessonId}`)
      console.log('Lesson response:', response.data)
      setLesson(response.data)

      // Fetch sub-lessons
      console.log('Fetching sub-lessons...')
      const subLessonsRes = await axios.get(`/lessons/${lessonId}/sub-lessons`)
      const subs = Array.isArray(subLessonsRes.data) ? subLessonsRes.data : []
      console.log('Sub-lessons:', subs.length)
      setSubLessons(subs)

      // Fetch materials and exercises for each sub-lesson
      const materialsMap = {}
      const exercisesMap = {}

      for (const sub of subs) {
        if (!sub || !sub.subLessonId) {
          console.warn('Invalid sub-lesson:', sub)
          continue
        }

        try {
          const [matRes, exRes] = await Promise.all([
            axios.get(`/sub-lessons/${sub.subLessonId}/materials`).catch(err => {
              console.error(`Error fetching materials for sub-lesson ${sub.subLessonId}:`, err)
              return { data: [] }
            }),
            axios.get(`/sub-lessons/${sub.subLessonId}/exercises`).catch(err => {
              console.error(`Error fetching exercises for sub-lesson ${sub.subLessonId}:`, err)
              return { data: [] }
            })
          ])
          materialsMap[sub.subLessonId] = Array.isArray(matRes.data) ? matRes.data : []
          exercisesMap[sub.subLessonId] = Array.isArray(exRes.data) ? exRes.data : []
        } catch (err) {
          console.error(`Error processing sub-lesson ${sub.subLessonId}:`, err)
          materialsMap[sub.subLessonId] = []
          exercisesMap[sub.subLessonId] = []
        }
      }

      console.log('Materials map:', Object.keys(materialsMap).length)
      console.log('Exercises map:', Object.keys(exercisesMap).length)
      setSubLessonMaterials(materialsMap)
      setSubLessonExercises(exercisesMap)

    } catch (error) {
      console.error('Error fetching lesson details:', error)
      console.error('Error details:', error.message, error.response?.data)
      alert('Error loading lesson. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    if (!user?.userId) return

    try {
      const paths = await axios.get(`/lessons/users/${user.userId}/learning-path`)
      const userPath = paths.data.find(p => p.lesson?.lessonId === lessonId)
      if (userPath) {
        setProgress(userPath.progressPercentage || 0)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const handleStartLesson = async () => {
    if (!user?.userId) return
    try {
      await axios.post(`/lessons/users/${user.userId}/start/${lessonId}`)
      setProgress(10)
    } catch (error) {
      console.error('Error starting lesson:', error)
      alert('Error starting lesson. Please try again.')
    }
  }

  const handleCompleteLesson = async (accuracy) => {
    if (!user?.userId) return
    try {
      const response = await axios.post(`/lessons/users/${user.userId}/complete/${lessonId}`, null, {
        params: { accuracyPercentage: accuracy }
      })

      // Collect all exercises with user answers for review
      const allExercises = Object.values(subLessonExercises).flat()
      const exercisesWithAnswers = allExercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        title: exercise.title,
        questionText: exercise.questionText,
        exerciseType: exercise.exerciseType,
        correctAnswer: exercise.correctAnswer,
        options: exercise.options || [],
        userAnswer: userAnswers[exercise.exerciseId] || null
      }))

      const resultData = {
        title: lesson.title,
        progress: 100,
        accuracy: accuracy,
        xp: lesson.xpReward || 0,
        exercises: exercisesWithAnswers
      }

      // Store in localStorage for later retrieval
      const storageKey = `lesson_result_${lessonId}_${user.userId}`
      localStorage.setItem(storageKey, JSON.stringify(resultData))
      console.log('💾 Saved exercise data to localStorage:', storageKey)

      navigate(`/dashboard/lessons/${lessonId}/result`, { state: { result: resultData } })
    } catch (error) {
      console.error('Error completing lesson:', error)
      alert('Error completing lesson. Please try again.')
    }
  }

  const handleUpdateProgress = async (newProgress, accuracy) => {
    if (!user?.userId) return
    try {
      const progressVal = Math.round(newProgress)
      const accuracyVal = accuracy !== undefined ? Math.round(accuracy) : null

      await axios.put(`/lessons/users/${user.userId}/progress/${lessonId}`, null, {
        params: {
          progressPercentage: progressVal,
          accuracyPercentage: accuracyVal
        }
      })
      setProgress(progressVal)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleMarkMaterialViewed = (materialId) => {
    setViewedMaterials(prev => {
      const next = new Set(prev)
      next.add(materialId)

      const allMaterials = Object.values(subLessonMaterials).flat()
      const totalMaterials = allMaterials.length

      if (totalMaterials > 0) {
        const viewedCount = next.size
        const materialProgress = (viewedCount / totalMaterials) * 50

        // Only update if it's an increase
        if (materialProgress > progress) {
          handleUpdateProgress(materialProgress)
        }

        if (viewedCount === totalMaterials && !isExercisesUnlocked) {
          setIsExercisesUnlocked(true)
          setShowExercises(true)
        }
      }

      return next
    })
  }

  const handleAnswerSelect = (exerciseId, optionId, isCorrect, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: {
        optionId,
        isCorrect,
        answer // Store the text answer for fill-in-the-blank and text input
      }
    }))
  }

  const handleCheckAnswers = async () => {
    const allExercises = Object.values(subLessonExercises).flat()
    const totalEx = allExercises.length

    if (totalEx === 0) {
      await handleCompleteLesson(100)
      return
    }

    const answeredIds = Object.keys(userAnswers)
    if (answeredIds.length < totalEx) {
      alert(`Please answer all exercises first! (${answeredIds.length}/${totalEx})`)
      return
    }

    const correctCount = Object.values(userAnswers).filter(ans => ans.isCorrect).length
    const accuracy = Math.round((correctCount / totalEx) * 100)

    // Total progress = 50% (materials) + (correct/total * 50%)
    // But if they clicked this, we assume they finished materials (which is 50%)
    // If they get everything right, it's 100%.

    if (correctCount === totalEx) {
      await handleCompleteLesson(100)
    } else {
      const finalProgress = 50 + Math.floor((correctCount / totalEx) * 50)
      // Even if not 100%, we treat it as "done" for the sake of the exercise flow
      // or we can allow them to see results anyway. 
      // User asked: "chuyển sang trang khác hiện phần trăm tiến độ học và phần trăm trả lời dúng"
      await handleCompleteLesson(accuracy)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading lesson...</div>
  }

  if (!lesson) {
    return <div className="text-center py-12">Lesson not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        <p className="text-gray-600 mt-2">{lesson.description}</p>
        <div className="flex items-center space-x-4 mt-4">
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {lesson.lessonType}
          </span>
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            {lesson.level}
          </span>
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{lesson.estimatedDurationMinutes || 15} min</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{lesson.xpReward} XP</span>
          </div>
        </div>
      </div>

      {progress > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Your Progress</span>
            <span className="font-bold text-primary-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="card">
        <div className="prose max-w-none">
          {lesson.content && (
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} className="mb-8" />
          )}

          {subLessons && subLessons.length > 0 ? (
            <div className="space-y-8">
              {subLessons.map((subLesson) => (
                <div key={subLesson?.subLessonId || Math.random()} className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{subLesson?.title || 'Untitled'}</h2>
                  {subLesson?.content && (
                    <div className="text-gray-700 mb-4">{subLesson.content}</div>
                  )}

                  <div className="space-y-6">
                    {/* Materials */}
                    {subLessonMaterials[subLesson?.subLessonId] && Array.isArray(subLessonMaterials[subLesson.subLessonId]) && subLessonMaterials[subLesson.subLessonId].map((material) => (
                      <div key={material.materialId} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2 font-semibold">
                          {material.materialType === 'VIDEO' && <span className="text-red-500">📺 Video</span>}
                          {material.materialType === 'AUDIO' && <span className="text-blue-500">🎧 Audio</span>}
                          {material.materialType === 'TEXT' && <span className="text-gray-500">📄 Reading</span>}
                          {material.materialType === 'PDF' && <span className="text-purple-500">📑 PDF</span>}
                          {material.materialType === 'IMAGE' && <span className="text-green-500">🖼️ Image</span>}
                          <span>{material.title}</span>
                        </div>

                        {material.content && (
                          <div className="prose max-w-none text-sm mb-3">
                            {material.content}
                          </div>
                        )}

                        {material.materialType === 'VIDEO' && material.fileUrl && (
                          <div className="aspect-w-16 aspect-h-9">
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
                              className="w-full h-64 rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {material.materialType === 'AUDIO' && material.fileUrl && (
                          <audio controls className="w-full">
                            <source src={material.fileUrl} />
                            Your browser does not support the audio element.
                          </audio>
                        )}

                        {material.materialType === 'IMAGE' && material.fileUrl && (
                          <img src={material.fileUrl} alt={material.title} className="rounded-lg max-w-full h-auto" />
                        )}

                        {material.materialType === 'PDF' && material.fileUrl && (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Download PDF
                          </a>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <button
                            onClick={() => handleMarkMaterialViewed(material.materialId)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${viewedMaterials.has(material.materialId)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            {viewedMaterials.has(material.materialId) ? 'Viewed' : 'Mark as Viewed'}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Exercises */}
                    {isExercisesUnlocked && subLessonExercises[subLesson?.subLessonId] && Array.isArray(subLessonExercises[subLesson.subLessonId]) && subLessonExercises[subLesson.subLessonId].length > 0 && (
                      <div className="mt-8 space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Exercises</h3>
                        {subLessonExercises[subLesson.subLessonId].map((exercise, index) => (
                          <div key={exercise.exerciseId} className="bg-white border rounded-xl p-5 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                              <span className="flex-shrink-0 w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{exercise.title}</h4>
                                <p className="text-gray-700 mt-1">{exercise.questionText}</p>
                                {exercise.exerciseType && (
                                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                    {exercise.exerciseType.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="ml-10">
                              {/* MULTIPLE CHOICE */}
                              {exercise.exerciseType === 'MULTIPLE_CHOICE' && exercise.options && (
                                <div className="grid gap-3">
                                  {exercise.options.map((option) => (
                                    <button
                                      key={option.optionId}
                                      onClick={() => handleAnswerSelect(exercise.exerciseId, option.optionId, option.isCorrect)}
                                      className={`text-left p-4 rounded-xl border-2 transition-all ${userAnswers[exercise.exerciseId]?.optionId === option.optionId
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{option.optionText}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* FILL IN THE BLANK */}
                              {exercise.exerciseType === 'FILL_BLANK' && (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={userAnswers[exercise.exerciseId]?.answer || ''}
                                    onChange={(e) => {
                                      const userInput = e.target.value.trim().toLowerCase()
                                      const correctAnswer = exercise.correctAnswer?.trim().toLowerCase()
                                      handleAnswerSelect(exercise.exerciseId, null, userInput === correctAnswer, e.target.value)
                                    }}
                                    placeholder="Type your answer here..."
                                    className={`w-full p-4 rounded-xl border-2 transition-all ${userAnswers[exercise.exerciseId]?.answer
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                      }`}
                                  />
                                </div>
                              )}

                              {/* TEXT INPUT */}
                              {exercise.exerciseType === 'TEXT_INPUT' && (
                                <div className="space-y-3">
                                  <textarea
                                    value={userAnswers[exercise.exerciseId]?.answer || ''}
                                    onChange={(e) => {
                                      const userInput = e.target.value.trim().toLowerCase()
                                      const correctAnswer = exercise.correctAnswer?.trim().toLowerCase()
                                      handleAnswerSelect(exercise.exerciseId, null, userInput === correctAnswer, e.target.value)
                                    }}
                                    placeholder="Type your answer here..."
                                    rows={4}
                                    className={`w-full p-4 rounded-xl border-2 transition-all resize-none ${userAnswers[exercise.exerciseId]?.answer
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                      }`}
                                  />
                                </div>
                              )}

                              {/* MATCHING */}
                              {exercise.exerciseType === 'MATCHING' && exercise.options && (
                                <div className="space-y-3">
                                  <p className="text-sm text-gray-600 mb-3">Match the items by selecting the correct pairs</p>
                                  <div className="grid gap-3">
                                    {exercise.options.map((option) => (
                                      <button
                                        key={option.optionId}
                                        onClick={() => handleAnswerSelect(exercise.exerciseId, option.optionId, option.isCorrect)}
                                        className={`text-left p-4 rounded-xl border-2 transition-all ${userAnswers[exercise.exerciseId]?.optionId === option.optionId
                                          ? 'border-blue-500 bg-blue-50 shadow-md'
                                          : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">{option.optionText}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Fallback for unknown exercise types */}
                              {!['MULTIPLE_CHOICE', 'FILL_BLANK', 'TEXT_INPUT', 'MATCHING'].includes(exercise.exerciseType) && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-yellow-800">⚠️ Unsupported exercise type: {exercise.exerciseType}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isExercisesUnlocked && subLessonExercises[subLesson?.subLessonId]?.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center text-gray-600 border-2 border-dashed">
                        <p>🔒 Exercises will be unlocked after you view all materials.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !lesson.content && (
              <div className="p-8 text-center text-gray-600">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Lesson content will be displayed here</p>
                <p className="text-sm mt-2">Start the lesson to begin learning!</p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {progress === 0 ? (
          <button
            onClick={handleStartLesson}
            className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Start Lesson</span>
          </button>
        ) : progress < 100 ? (
          <button
            onClick={handleCheckAnswers}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Check & Submit Answers
          </button>
        ) : (
          <button
            onClick={() => navigate(`/dashboard/lessons/${lessonId}/result`)}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            <span>View Lesson Results</span>
          </button>
        )}
      </div>
    </div>
  )
}
