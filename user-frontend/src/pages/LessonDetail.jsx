import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Clock, CheckCircle, Play, Video, Music, FileText, File, Image } from 'lucide-react'

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
            <div className="ql-snow mb-8">
              <div 
                className="ql-editor p-0" 
                dangerouslySetInnerHTML={{ __html: lesson.content }} 
              />
            </div>
          )}

          {subLessons && subLessons.length > 0 ? (
            <div className="space-y-12">
              {subLessons.map((subLesson) => (
                <div key={subLesson?.subLessonId || Math.random()} className="border-t pt-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">{subLesson?.title || 'Untitled'}</h2>
                  {subLesson?.content && (
                    <div className="ql-snow mb-6">
                      <div 
                        className="ql-editor p-0 text-gray-600 text-lg font-medium"
                        dangerouslySetInnerHTML={{ __html: subLesson.content }}
                      />
                    </div>
                  )}

                  <div className="space-y-8">
                    {/* Materials */}
                    {subLessonMaterials[subLesson?.subLessonId] && Array.isArray(subLessonMaterials[subLesson.subLessonId]) && subLessonMaterials[subLesson.subLessonId].map((material) => (
                      <div key={material.materialId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4 border-b pb-3 border-gray-50">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            {material.materialType === 'VIDEO' && <Video className="w-5 h-5 text-red-500" />}
                            {material.materialType === 'AUDIO' && <Music className="w-5 h-5 text-blue-500" />}
                            {material.materialType === 'TEXT' && <FileText className="w-5 h-5 text-emerald-500" />}
                            {material.materialType === 'PDF' && <File className="w-5 h-5 text-purple-500" />}
                            {material.materialType === 'IMAGE' && <Image className="w-5 h-5 text-orange-500" />}
                          </div>
                          <span className="font-black text-gray-800 uppercase tracking-wider">{material.title}</span>
                        </div>

                        {material.content && (
                          <div className="ql-snow mb-4">
                            <div 
                              className="ql-editor p-4 bg-gray-50/50 rounded-xl border border-gray-100 text-gray-700"
                              dangerouslySetInnerHTML={{ __html: material.content }}
                            />
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
                      <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 border-b pb-4 border-gray-100">
                          <div className="p-2 bg-primary-100 rounded-xl">
                            <BookOpen className="w-6 h-6 text-primary-600" />
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Practice Exercises</h3>
                        </div>
                        
                        <div className="grid gap-6">
                          {subLessonExercises[subLesson.subLessonId].map((exercise, index) => (
                            <div key={exercise.exerciseId} className="bg-white border-2 border-gray-50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-6">
                                <span className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-primary-200">
                                  {index + 1}
                                </span>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">{exercise.title}</h4>
                                    {exercise.exerciseType && (
                                      <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded uppercase tracking-widest">
                                        {exercise.exerciseType.replace('_', ' ')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-lg font-medium leading-relaxed">{exercise.questionText}</p>
                                </div>
                              </div>

                              <div className="mt-8 ml-16">
                                {/* MULTIPLE CHOICE */}
                                {exercise.exerciseType === 'MULTIPLE_CHOICE' && exercise.options && (
                                  <div className="grid gap-4">
                                    {exercise.options.map((option) => (
                                      <button
                                        key={option.optionId}
                                        onClick={() => handleAnswerSelect(exercise.exerciseId, option.optionId, option.isCorrect)}
                                        className={`text-left p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${userAnswers[exercise.exerciseId]?.optionId === option.optionId
                                          ? 'border-primary-500 bg-primary-50 shadow-md translate-x-1'
                                          : 'border-gray-50 hover:border-primary-200 hover:bg-gray-50 hover:translate-x-1'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between relative z-10">
                                          <span className={`font-bold text-lg ${userAnswers[exercise.exerciseId]?.optionId === option.optionId ? 'text-primary-700' : 'text-gray-700'}`}>
                                            {option.optionText}
                                          </span>
                                          {userAnswers[exercise.exerciseId]?.optionId === option.optionId && (
                                            <CheckCircle className="w-6 h-6 text-primary-600 animate-in zoom-in duration-300" />
                                          )}
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* FILL IN THE BLANK */}
                                {exercise.exerciseType === 'FILL_BLANK' && (
                                  <div className="max-w-md">
                                    <input
                                      type="text"
                                      value={userAnswers[exercise.exerciseId]?.answer || ''}
                                      onChange={(e) => {
                                        const userInput = e.target.value.trim().toLowerCase()
                                        const correctAnswer = exercise.correctAnswer?.trim().toLowerCase()
                                        handleAnswerSelect(exercise.exerciseId, null, userInput === correctAnswer, e.target.value)
                                      }}
                                      placeholder="Type your answer here..."
                                      className={`w-full p-5 rounded-2xl border-2 transition-all text-lg font-bold ${userAnswers[exercise.exerciseId]?.answer
                                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                                        : 'border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none'
                                        }`}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
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
