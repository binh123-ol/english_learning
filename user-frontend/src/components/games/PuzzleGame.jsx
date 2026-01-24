import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, RotateCcw, Lightbulb, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import { startGameSession, completeGameSession } from '../../utils/gameSession'

export default function PuzzleGame({ gameData, onComplete }) {
    const navigate = useNavigate()
    const [puzzles, setPuzzles] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState([])
    const [shuffledPieces, setShuffledPieces] = useState([])
    const [showHint, setShowHint] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [score, setScore] = useState(0)
    const [attempts, setAttempts] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [sessionId, setSessionId] = useState(null)

    useEffect(() => {
        initializeGame()
    }, [gameData?.gameId])

    const initializeGame = async () => {
        const newSessionId = await startGameSession(gameData.gameId)
        setSessionId(newSessionId)
        await fetchPuzzles()
    }

    const fetchPuzzles = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${gameData.gameId}/content`)
            const gamePuzzles = response.data || []

            if (gamePuzzles.length === 0) {
                alert('This game has no content yet. Please add puzzles in the admin panel.')
                return
            }

            const formattedPuzzles = gamePuzzles.map(p => ({
                id: p.puzzleId,
                sentence: p.sentence,
                hint: p.hint
            }))

            setPuzzles(formattedPuzzles)
            if (formattedPuzzles.length > 0) {
                initializePuzzle(formattedPuzzles[0])
            }
        } catch (error) {
            console.error('Error fetching puzzles:', error)
            alert('Error loading game content. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const initializePuzzle = (puzzle) => {
        const pieces = puzzle.sentence.split(' ')
        const shuffled = [...pieces].sort(() => Math.random() - 0.5)
        setShuffledPieces(shuffled)
        setUserAnswer([])
        setIsCorrect(false)
        setShowHint(false)
    }

    const currentPuzzle = puzzles[currentIndex]

    const handlePieceClick = (piece, index) => {
        if (isCorrect) return
        setUserAnswer([...userAnswer, piece])
        setShuffledPieces(shuffledPieces.filter((_, i) => i !== index))
    }

    const handleRemovePiece = (index) => {
        if (isCorrect) return
        const piece = userAnswer[index]
        setShuffledPieces([...shuffledPieces, piece])
        setUserAnswer(userAnswer.filter((_, i) => i !== index))
    }

    const handleCheck = () => {
        setAttempts(attempts + 1)
        const userSentence = userAnswer.join(' ')
        const correctSentence = currentPuzzle.sentence

        if (userSentence === correctSentence) {
            setIsCorrect(true)
            setScore(score + 10)

            setTimeout(async () => {
                if (currentIndex < puzzles.length - 1) {
                    setCurrentIndex(currentIndex + 1)
                    initializePuzzle(puzzles[currentIndex + 1])
                } else {
                    const finalScore = score + 10
                    await completeGameSession(sessionId, finalScore)
                    setShowResults(true)
                    onComplete?.(finalScore)
                }
            }, 2000)
        }
    }

    const handleReset = () => {
        setCurrentIndex(0)
        setScore(0)
        setAttempts(0)
        setShowResults(false)
        initializeGame()
    }

    const handleSkip = async () => {
        setAttempts(attempts + 1)
        if (currentIndex < puzzles.length - 1) {
            setCurrentIndex(currentIndex + 1)
            initializePuzzle(puzzles[currentIndex + 1])
        } else {
            await completeGameSession(sessionId, score)
            setShowResults(true)
            onComplete?.(score)
        }
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading puzzles...</p>
            </div>
        )
    }

    if (puzzles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No puzzles available for this game.</p>
            </div>
        )
    }

    if (showResults) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="card bg-gradient-puzzle text-white text-center py-12">
                    <Trophy className="w-20 h-20 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-3xl font-bold mb-4">Hoàn thành! 🎉</h2>
                    <div className="space-y-2 text-lg">
                        <p>Tổng số câu: {puzzles.length}</p>
                        <p>Lượt thử: {attempts}</p>
                        <p className="text-2xl font-bold mt-4">Điểm số: {score}</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="mt-8 px-6 py-3 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
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
                    <h2 className="text-2xl font-bold bg-gradient-puzzle bg-clip-text text-transparent">
                        Puzzle Game
                    </h2>
                    <p className="text-gray-600 mt-1">Sắp xếp các từ thành câu hoàn chỉnh</p>
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
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Chơi lại</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Câu</p>
                    <p className="text-2xl font-bold text-gray-900">{currentIndex + 1}/{puzzles.length}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Điểm</p>
                    <p className="text-2xl font-bold text-yellow-600">{score}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Lượt thử</p>
                    <p className="text-2xl font-bold text-blue-600">{attempts}</p>
                </div>
            </div>

            <div className="progress-bar">
                <div
                    className="progress-bar-fill bg-gradient-puzzle"
                    style={{ width: `${((currentIndex + 1) / puzzles.length) * 100}%` }}
                />
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                {showHint && (
                    <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg animate-fadeIn">
                        <div className="flex items-center space-x-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-yellow-600" />
                            <p className="text-sm font-medium text-yellow-800">Gợi ý:</p>
                        </div>
                        <p className="text-gray-800">{currentPuzzle.hint}</p>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Câu trả lời của bạn:</h3>
                    <div className="min-h-[80px] p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                        {userAnswer.length === 0 ? (
                            <p className="text-gray-400 text-center">Nhấp vào các từ bên dưới để xây dựng câu</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {userAnswer.map((piece, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRemovePiece(index)}
                                        className="px-4 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
                                    >
                                        {piece}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Các từ:</h3>
                    <div className="flex flex-wrap gap-2">
                        {shuffledPieces.map((piece, index) => (
                            <button
                                key={index}
                                onClick={() => handlePieceClick(piece, index)}
                                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-yellow-400 transition-all font-medium"
                            >
                                {piece}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                    >
                        <Lightbulb className="w-5 h-5" />
                        <span>{showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}</span>
                    </button>
                    <button
                        onClick={handleCheck}
                        disabled={userAnswer.length === 0 || isCorrect}
                        className="flex-1 px-4 py-3 bg-gradient-puzzle text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Kiểm tra
                    </button>
                    <button
                        onClick={handleSkip}
                        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Bỏ qua
                    </button>
                </div>

                {isCorrect && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-fadeIn">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2 animate-bounce" />
                        <p className="text-green-800 font-semibold text-lg">Chính xác! 🎉</p>
                    </div>
                )}
            </div>

            <div className="card bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                    <strong>Hướng dẫn:</strong> Nhấp vào các từ để xây dựng câu hoàn chỉnh. Nhấp vào từ trong câu trả lời để xóa. Sử dụng gợi ý nếu cần trợ giúp.
                </p>
            </div>
        </div>
    )
}
