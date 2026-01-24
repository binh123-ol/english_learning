import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RotateCcw, Trophy, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import { startGameSession, completeGameSession } from '../../utils/gameSession'

export default function FlashcardGame({ gameData, onComplete }) {
    const navigate = useNavigate()
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [knownCards, setKnownCards] = useState([])
    const [learningCards, setLearningCards] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [sessionId, setSessionId] = useState(null)

    useEffect(() => {
        initializeGame()
    }, [gameData?.gameId])

    const initializeGame = async () => {
        const newSessionId = await startGameSession(gameData.gameId)
        setSessionId(newSessionId)
        await fetchCards()
    }

    const fetchCards = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${gameData.gameId}/content`)
            const flashcards = response.data || []

            if (flashcards.length === 0) {
                alert('This game has no content yet. Please add flashcards in the admin panel.')
                return
            }

            // Transform API data to game format
            const formattedCards = flashcards.map(card => ({
                id: card.cardId,
                front: card.front,
                back: card.back,
                example: card.example
            }))

            setCards(formattedCards)
        } catch (error) {
            console.error('Error fetching flashcards:', error)
            alert('Error loading game content. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const currentCard = cards[currentIndex]

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleKnow = () => {
        if (!knownCards.includes(currentCard.id)) {
            setKnownCards([...knownCards, currentCard.id])
        }
        nextCard()
    }

    const handleStillLearning = () => {
        if (!learningCards.includes(currentCard.id)) {
            setLearningCards([...learningCards, currentCard.id])
        }
        nextCard()
    }

    const nextCard = async () => {
        setIsFlipped(false)
        if (currentIndex < cards.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300)
        } else {
            // Game completed
            setTimeout(async () => {
                const score = Math.round((knownCards.length / cards.length) * 100)
                await completeGameSession(sessionId, score)
                setShowResults(true)
                onComplete?.(score)
            }, 300)
        }
    }

    const previousCard = () => {
        setIsFlipped(false)
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleReset = () => {
        setCurrentIndex(0)
        setIsFlipped(false)
        setKnownCards([])
        setLearningCards([])
        setShowResults(false)
        initializeGame()
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading flashcards...</p>
            </div>
        )
    }

    if (cards.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No flashcards available for this game.</p>
            </div>
        )
    }

    if (showResults) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="card bg-gradient-flashcard text-white text-center py-12">
                    <Trophy className="w-20 h-20 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Hoàn thành! 🎉</h2>
                    <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mt-8">
                        <div>
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <CheckCircle className="w-6 h-6" />
                                <span className="text-2xl font-bold">{knownCards.length}</span>
                            </div>
                            <p className="text-sm opacity-90">Đã biết</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <XCircle className="w-6 h-6" />
                                <span className="text-2xl font-bold">{learningCards.length}</span>
                            </div>
                            <p className="text-sm opacity-90">Đang học</p>
                        </div>
                    </div>
                    <button
                        onClick={handleReset}
                        className="mt-8 px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Học lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-flashcard bg-clip-text text-transparent">
                        Flashcard Game
                    </h2>
                    <p className="text-gray-600 mt-1">Lật thẻ để học từ vựng</p>
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
                        className="flex items-center space-x-2 px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Chơi lại</span>
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Thẻ {currentIndex + 1} / {cards.length}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{knownCards.length}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">{learningCards.length}</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
                <div
                    className="progress-bar-fill bg-gradient-flashcard"
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
            </div>

            {/* Flashcard */}
            <div className="perspective-1000">
                <div
                    className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                    onClick={handleFlip}
                >
                    <div className="flashcard-front">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-4">Tiếng Anh</p>
                            <h3 className="text-4xl font-bold text-gray-900 mb-4">{currentCard.front}</h3>
                            <p className="text-sm text-gray-400">Nhấp để lật thẻ</p>
                        </div>
                    </div>
                    <div className="flashcard-back">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-4">Tiếng Việt</p>
                            <h3 className="text-4xl font-bold text-gray-900 mb-4">{currentCard.back}</h3>
                            {currentCard.example && (
                                <p className="text-sm text-gray-600 italic mt-6">
                                    "{currentCard.example}"
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={previousCard}
                    disabled={currentIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Trước</span>
                </button>

                {isFlipped && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleStillLearning}
                            className="px-6 py-3 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 transition-colors"
                        >
                            Đang học
                        </button>
                        <button
                            onClick={handleKnow}
                            className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                        >
                            Đã biết
                        </button>
                    </div>
                )}

                <button
                    onClick={nextCard}
                    disabled={currentIndex === cards.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Sau</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Instructions */}
            <div className="card bg-pink-50 border border-pink-200">
                <p className="text-sm text-pink-800">
                    <strong>Hướng dẫn:</strong> Nhấp vào thẻ để lật và xem nghĩa. Đánh dấu "Đã biết" nếu bạn nhớ từ này, hoặc "Đang học" nếu cần ôn lại.
                </p>
            </div>
        </div>
    )
}
