import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, RotateCcw, Clock, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import { startGameSession, completeGameSession } from '../../utils/gameSession'

export default function QuizGame({ gameData, onComplete }) {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [score, setScore] = useState(0)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [userAnswers, setUserAnswers] = useState([])
    const [timeLeft, setTimeLeft] = useState(30)
    const [isTimerActive, setIsTimerActive] = useState(true)
    const [showResults, setShowResults] = useState(false)
    const [sessionId, setSessionId] = useState(null)

    useEffect(() => {
        initializeGame()
    }, [gameData?.gameId])

    const initializeGame = async () => {
        const newSessionId = await startGameSession(gameData.gameId)
        setSessionId(newSessionId)
        await fetchQuestions()
    }

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${gameData.gameId}/content`)
            const quizQuestions = response.data || []

            if (quizQuestions.length === 0) {
                alert('This game has no content yet. Please add quiz questions in the admin panel.')
                return
            }

            const formattedQuestions = quizQuestions.map(q => ({
                id: q.questionId,
                question: q.question,
                options: [q.optionA, q.optionB, q.optionC, q.optionD],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
            }))

            setQuestions(formattedQuestions)
        } catch (error) {
            console.error('Error fetching quiz questions:', error)
            alert('Error loading game content. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const currentQuestion = questions[currentIndex]

    useEffect(() => {
        if (!isTimerActive || showFeedback || loading) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleTimeout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isTimerActive, showFeedback, currentIndex, loading])

    const handleTimeout = () => {
        setIsTimerActive(false)
        setShowFeedback(true)
        setUserAnswers([...userAnswers, { questionId: currentQuestion.id, answer: null, correct: false }])

        setTimeout(() => {
            nextQuestion()
        }, 3000)
    }

    const handleAnswerSelect = (answerIndex) => {
        if (showFeedback) return

        setSelectedAnswer(answerIndex)
        setShowFeedback(true)
        setIsTimerActive(false)

        const isCorrect = answerIndex === currentQuestion.correctAnswer
        if (isCorrect) {
            setScore(score + 10)
            setCorrectAnswers(correctAnswers + 1)
        }

        setUserAnswers([...userAnswers, { questionId: currentQuestion.id, answer: answerIndex, correct: isCorrect }])

        setTimeout(() => {
            nextQuestion()
        }, 3000)
    }

    const nextQuestion = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setSelectedAnswer(null)
            setShowFeedback(false)
            setTimeLeft(30)
            setIsTimerActive(true)
        } else {
            const finalScore = Math.round((correctAnswers / questions.length) * 100)
            await completeGameSession(sessionId, finalScore)
            setShowResults(true)
            onComplete?.(finalScore)
        }
    }

    const handleReset = () => {
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setScore(0)
        setCorrectAnswers(0)
        setUserAnswers([])
        setTimeLeft(30)
        setIsTimerActive(true)
        setShowResults(false)
        initializeGame()
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading quiz questions...</p>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No quiz questions available for this game.</p>
            </div>
        )
    }

    if (showResults) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="card bg-gradient-quiz text-white text-center py-12">
                    <Trophy className="w-20 h-20 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-bold mb-4">Hoàn thành! 🎉</h2>
                    <div className="space-y-2 text-lg">
                        <p>Tổng số câu: {questions.length}</p>
                        <p>Đúng: {correctAnswers} câu</p>
                        <p>Sai: {questions.length - correctAnswers} câu</p>
                        <p className="text-2xl font-bold mt-4">Điểm số: {score}</p>
                        <p className="text-sm opacity-90">Tỷ lệ: {Math.round((correctAnswers / questions.length) * 100)}%</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="mt-8 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>Làm lại</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-quiz bg-clip-text text-transparent">
                        Quiz Game
                    </h2>
                    <p className="text-gray-600 mt-1">Trả lời các câu hỏi trắc nghiệm</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/dashboard/games')}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Thoát</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Làm lại</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Câu hỏi</p>
                    <p className="text-2xl font-bold text-gray-900">{currentIndex + 1}/{questions.length}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Điểm</p>
                    <p className="text-2xl font-bold text-green-600">{score}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Đúng</p>
                    <p className="text-2xl font-bold text-blue-600">{correctAnswers}</p>
                </div>
                <div className="card text-center bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center justify-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-yellow-600'}`}>
                            {timeLeft}s
                        </p>
                    </div>
                </div>
            </div>

            <div className="progress-bar">
                <div
                    className="progress-bar-fill bg-gradient-quiz"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
                <div className="mb-6">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                        Câu {currentIndex + 1}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index
                        const isCorrect = index === currentQuestion.correctAnswer
                        const showCorrect = showFeedback && isCorrect
                        const showIncorrect = showFeedback && isSelected && !isCorrect

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={showFeedback}
                                className={`answer-card text-left w-full ${showCorrect ? 'answer-card-correct' :
                                    showIncorrect ? 'answer-card-incorrect' :
                                        isSelected ? 'answer-card-selected' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-bold text-lg">{String.fromCharCode(65 + index)}.</span>
                                        <span>{option}</span>
                                    </div>
                                    {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                                    {showIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {showFeedback && currentQuestion.explanation && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn">
                        <p className="text-sm text-gray-600 mb-1">Giải thích:</p>
                        <p className="text-gray-800">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            <div className="card bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                    <strong>Hướng dẫn:</strong> Đọc câu hỏi và chọn đáp án đúng trong thời gian cho phép. Bạn có 30 giây cho mỗi câu hỏi.
                </p>
            </div>
        </div>
    )
}
