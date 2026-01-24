import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, CheckCircle, XCircle, Trophy, RotateCcw, Lightbulb, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import { startGameSession, completeGameSession } from '../../utils/gameSession'

export default function SpellingGame({ gameData, onComplete }) {
    const navigate = useNavigate()
    const [words, setWords] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userInput, setUserInput] = useState('')
    const [showHint, setShowHint] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [score, setScore] = useState(0)
    const [attempts, setAttempts] = useState(0)
    const [completedWords, setCompletedWords] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const inputRef = useRef(null)

    useEffect(() => {
        initializeGame()
    }, [gameData?.gameId])

    const initializeGame = async () => {
        const newSessionId = await startGameSession(gameData.gameId)
        setSessionId(newSessionId)
        await fetchWords()
    }

    const fetchWords = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${gameData.gameId}/content`)
            const spellingWords = response.data || []

            if (spellingWords.length === 0) {
                alert('This game has no content yet. Please add spelling words in the admin panel.')
                return
            }

            const formattedWords = spellingWords.map(word => ({
                id: word.wordId,
                word: word.word,
                hint: word.hint
            }))

            setWords(formattedWords)
        } catch (error) {
            console.error('Error fetching spelling words:', error)
            alert('Error loading game content. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const currentWord = words[currentIndex]
    const progress = (completedWords.length / words.length) * 100

    const playAudio = () => {
        if ('speechSynthesis' in window && currentWord) {
            const utterance = new SpeechSynthesisUtterance(currentWord.word)
            utterance.lang = 'en-US'
            utterance.rate = 0.8
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!userInput.trim()) return

        setAttempts(attempts + 1)

        if (userInput.toLowerCase().trim() === currentWord.word.toLowerCase()) {
            setFeedback('correct')
            setScore(score + 10)
            setCompletedWords([...completedWords, currentWord.id])

            setTimeout(async () => {
                if (currentIndex < words.length - 1) {
                    setCurrentIndex(currentIndex + 1)
                    setUserInput('')
                    setFeedback(null)
                    setShowHint(false)
                    inputRef.current?.focus()
                } else {
                    const finalScore = score + 10
                    await completeGameSession(sessionId, finalScore)
                    setShowResults(true)
                    onComplete?.(finalScore)
                }
            }, 1500)
        } else {
            setFeedback('incorrect')
            setTimeout(() => setFeedback(null), 1000)
        }
    }

    const handleSkip = async () => {
        setAttempts(attempts + 1)
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setUserInput('')
            setFeedback(null)
            setShowHint(false)
        } else {
            await completeGameSession(sessionId, score)
            setShowResults(true)
            onComplete?.(score)
        }
    }

    const handleReset = () => {
        setCurrentIndex(0)
        setUserInput('')
        setShowHint(false)
        setFeedback(null)
        setScore(0)
        setAttempts(0)
        setCompletedWords([])
        setShowResults(false)
        initializeGame()
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading spelling words...</p>
            </div>
        )
    }

    if (words.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No spelling words available for this game.</p>
            </div>
        )
    }

    if (showResults) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="card bg-gradient-spelling text-white text-center py-12">
                    <Trophy className="w-20 h-20 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-bold mb-4">Hoàn thành! 🎉</h2>
                    <div className="space-y-2 text-lg">
                        <p>Tổng số từ: {words.length}</p>
                        <p>Đúng: {completedWords.length} từ</p>
                        <p>Lượt thử: {attempts}</p>
                        <p className="text-2xl font-bold mt-4">Điểm số: {score}</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="mt-8 px-6 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>Chơi lại</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-spelling bg-clip-text text-transparent">
                        Spelling Game
                    </h2>
                    <p className="text-gray-600 mt-1">Nghe và đánh vần từ tiếng Anh</p>
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
                        className="flex items-center space-x-2 px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Chơi lại</span>
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Từ {currentIndex + 1} / {words.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-bar-fill bg-gradient-spelling" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className="text-3xl font-bold text-cyan-600">{score}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Đúng</p>
                    <p className="text-3xl font-bold text-green-600">{completedWords.length}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Lượt thử</p>
                    <p className="text-3xl font-bold text-blue-600">{attempts}</p>
                </div>
            </div>

            <div className="card bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
                <div className="text-center mb-8">
                    <button
                        onClick={playAudio}
                        className="mx-auto p-8 bg-gradient-spelling text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95"
                    >
                        <Volume2 className="w-16 h-16" />
                    </button>
                    <p className="text-sm text-gray-600 mt-4">Nhấp để nghe từ</p>
                </div>

                <div className="flex justify-center mb-6 space-x-2">
                    {currentWord.word.split('').map((char, index) => (
                        <div
                            key={index}
                            className="w-10 h-12 border-2 border-cyan-300 rounded bg-white flex items-center justify-center text-xl font-bold text-gray-400"
                        >
                            {showHint ? char : '_'}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Nhập từ bạn nghe được..."
                            className={`input text-center text-2xl font-semibold ${feedback === 'correct' ? 'border-green-500 bg-green-50' :
                                feedback === 'incorrect' ? 'border-red-500 bg-red-50' : ''
                                }`}
                            autoFocus
                            disabled={feedback === 'correct'}
                        />
                        {feedback === 'correct' && (
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500 animate-bounce" />
                        )}
                        {feedback === 'incorrect' && (
                            <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-red-500 animate-shake" />
                        )}
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowHint(!showHint)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                        >
                            <Lightbulb className="w-5 h-5" />
                            <span>{showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}</span>
                        </button>
                        <button
                            type="submit"
                            disabled={!userInput.trim() || feedback === 'correct'}
                            className="flex-1 px-4 py-3 bg-gradient-spelling text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Kiểm tra
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleSkip}
                        className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                        Bỏ qua từ này
                    </button>
                </form>

                {showHint && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center animate-fadeIn">
                        <p className="text-sm text-gray-600">Nghĩa tiếng Việt:</p>
                        <p className="text-lg font-semibold text-yellow-800">{currentWord.hint}</p>
                    </div>
                )}

                {feedback === 'correct' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-fadeIn">
                        <p className="text-green-800 font-semibold">✓ Chính xác! Từ đúng là: <span className="text-xl">{currentWord.word}</span></p>
                    </div>
                )}
                {feedback === 'incorrect' && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center animate-shake">
                        <p className="text-red-800 font-semibold">✗ Chưa đúng, hãy thử lại!</p>
                    </div>
                )}
            </div>

            <div className="card bg-cyan-50 border border-cyan-200">
                <p className="text-sm text-cyan-800">
                    <strong>Hướng dẫn:</strong> Nhấp vào biểu tượng loa để nghe từ, sau đó đánh vần từ vào ô bên dưới. Bạn có thể nhấn "Hiện gợi ý" nếu cần trợ giúp.
                </p>
            </div>
        </div>
    )
}
