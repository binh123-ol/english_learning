import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, CheckCircle, Target, Zap, ArrowRight, Home, ChevronDown, ChevronUp } from 'lucide-react'
import axios from '../api/axios'

export default function LessonResult() {
    const { lessonId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)
    const [showReview, setShowReview] = useState(true)

    // Get results from navigation state or fetch from API
    useEffect(() => {
        if (location.state?.result) {
            console.log('📊 Result data from navigation:', location.state.result)
            console.log('📝 Exercises data:', location.state.result.exercises)
            setResult(location.state.result)
            setLoading(false)
        } else {
            fetchLatestResult()
        }
    }, [lessonId])

    const fetchLatestResult = async () => {
        try {
            setLoading(true)
            const userStr = localStorage.getItem('user')
            if (!userStr) {
                navigate('/login')
                return
            }
            const user = JSON.parse(userStr)
            const userId = user.userId || user.id

            // Try to get stored exercise data from localStorage first
            const storageKey = `lesson_result_${lessonId}_${userId}`
            const storedResult = localStorage.getItem(storageKey)

            if (storedResult) {
                console.log('📦 Found stored exercise data in localStorage')
                const parsedResult = JSON.parse(storedResult)
                setResult(parsedResult)
                setLoading(false)
                return
            }

            // If no stored data, fetch from API (won't have exercise details)
            console.log('🔍 No stored data, fetching from API')
            const response = await axios.get(`/lessons/users/${userId}/progress`)
            const lessonProgress = response.data.find(p => p.lesson?.lessonId === lessonId)

            if (lessonProgress) {
                setResult({
                    title: lessonProgress.lesson?.title,
                    progress: lessonProgress.progressPercentage,
                    accuracy: lessonProgress.accuracyPercentage,
                    xp: lessonProgress.xpEarned || lessonProgress.lesson?.xpReward || 0,
                    exercises: [] // No exercise data available when fetching from API
                })
            }
        } catch (error) {
            console.error('Error fetching lesson result:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-20">Loading results...</div>
    }

    if (!result) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800">No results found</h2>
                <button
                    onClick={() => navigate('/dashboard/lessons')}
                    className="mt-4 btn btn-primary"
                >
                    Back to Lessons
                </button>
            </div>
        )
    }

    const isPerfect = result.accuracy === 100
    const hasExercises = result.exercises && result.exercises.length > 0

    console.log('✅ Has exercises:', hasExercises, 'Count:', result.exercises?.length)

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 animate-fadeIn">
            <div className="card text-center overflow-hidden">
                {/* Header Decoration */}
                <div className={`h-2 bg-gradient-to-r ${isPerfect ? 'from-yellow-400 to-orange-500' : 'from-blue-500 to-indigo-600'}`} />

                <div className="py-10 px-6">
                    <div className="mb-6 flex justify-center">
                        {isPerfect ? (
                            <div className="bg-yellow-100 p-4 rounded-full">
                                <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
                            </div>
                        ) : (
                            <div className="bg-blue-100 p-4 rounded-full">
                                <CheckCircle className="w-16 h-16 text-blue-500" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lesson Completed!</h1>
                    <p className="text-xl text-gray-600 mb-8">{result.title}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex justify-center mb-2">
                                <Target className="w-6 h-6 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{result.progress}%</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex justify-center mb-2">
                                <Zap className="w-6 h-6 text-yellow-500" />
                            </div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">XP Earned</p>
                            <p className="text-2xl font-bold text-gray-900">+{result.xp}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex justify-center mb-2">
                                <CheckCircle className="w-6 h-6 text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Accuracy</p>
                            <p className="text-2xl font-bold text-gray-900">{result.accuracy}%</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/dashboard/lessons')}
                            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <span>Continue Learning</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                            <Home className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>

            {isPerfect && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                    <p className="text-yellow-800 font-medium italic">"Excellent work! You've mastered this lesson with 100% accuracy!"</p>
                </div>
            )}

            {/* Question Review Section */}
            {hasExercises && (
                <div className="mt-8 card overflow-hidden">
                    <button
                        onClick={() => setShowReview(!showReview)}
                        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                {result.exercises.length}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Review Your Answers</h2>
                        </div>
                        {showReview ? <ChevronUp className="w-6 h-6 text-gray-600" /> : <ChevronDown className="w-6 h-6 text-gray-600" />}
                    </button>

                    {showReview && (
                        <div className="p-6 space-y-4">
                            {result.exercises.map((exercise, index) => {
                                const isCorrect = exercise.userAnswer?.isCorrect
                                const hasAnswer = exercise.userAnswer !== null

                                return (
                                    <div
                                        key={exercise.exerciseId}
                                        className={`border-2 rounded-xl p-5 ${isCorrect
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-gray-900">{exercise.title}</h3>
                                                    <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-2">{exercise.questionText}</p>
                                                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                                    {exercise.exerciseType.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ml-11 space-y-3">
                                            {/* Multiple Choice / Matching */}
                                            {(exercise.exerciseType === 'MULTIPLE_CHOICE' || exercise.exerciseType === 'MATCHING') && exercise.options && (
                                                <div className="space-y-2">
                                                    {exercise.options.map((option) => {
                                                        const isUserChoice = exercise.userAnswer?.optionId === option.optionId
                                                        const isCorrectOption = option.isCorrect

                                                        return (
                                                            <div
                                                                key={option.optionId}
                                                                className={`p-3 rounded-lg border-2 ${isUserChoice && isCorrectOption
                                                                    ? 'border-green-400 bg-green-100'
                                                                    : isUserChoice && !isCorrectOption
                                                                        ? 'border-red-400 bg-red-100'
                                                                        : isCorrectOption
                                                                            ? 'border-green-300 bg-green-50'
                                                                            : 'border-gray-200 bg-white'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium text-gray-900">{option.optionText}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        {isUserChoice && <span className="text-xs font-semibold text-blue-600">Your Answer</span>}
                                                                        {isCorrectOption && <span className="text-xs font-semibold text-green-600">Correct Answer</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {/* Fill in the Blank / Text Input */}
                                            {(exercise.exerciseType === 'FILL_BLANK' || exercise.exerciseType === 'TEXT_INPUT') && (
                                                <div className="space-y-2">
                                                    <div className={`p-3 rounded-lg border-2 ${isCorrect ? 'border-green-400 bg-green-100' : 'border-red-400 bg-red-100'
                                                        }`}>
                                                        <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                                                        <p className="font-medium text-gray-900">{exercise.userAnswer?.answer || '(No answer provided)'}</p>
                                                    </div>
                                                    {!isCorrect && (
                                                        <div className="p-3 rounded-lg border-2 border-green-300 bg-green-50">
                                                            <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
                                                            <p className="font-medium text-green-800">{exercise.correctAnswer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
