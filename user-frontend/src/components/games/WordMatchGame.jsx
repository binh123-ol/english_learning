import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import { startGameSession, completeGameSession } from '../../utils/gameSession'

export default function WordMatchGame({ gameData, onComplete }) {
    const navigate = useNavigate()
    const [pairs, setPairs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLeft, setSelectedLeft] = useState(null)
    const [selectedRight, setSelectedRight] = useState(null)
    const [matchedPairs, setMatchedPairs] = useState([])
    const [incorrectPairs, setIncorrectPairs] = useState([])
    const [score, setScore] = useState(0)
    const [attempts, setAttempts] = useState(0)
    const [sessionId, setSessionId] = useState(null)

    useEffect(() => {
        initializeGame()
    }, [gameData?.gameId])

    const initializeGame = async () => {
        const newSessionId = await startGameSession(gameData.gameId)
        setSessionId(newSessionId)
        await fetchPairs()
    }

    const fetchPairs = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${gameData.gameId}/content`)
            const wordPairs = response.data || []

            if (wordPairs.length === 0) {
                alert('This game has no content yet. Please add word pairs in the admin panel.')
                return
            }

            // Transform API data to game format
            const formattedPairs = wordPairs.map(pair => ({
                id: pair.pairId,
                left: pair.englishWord,
                right: pair.vietnameseTranslation
            }))

            // Shuffle the right column - create separate shuffled items with unique IDs
            const shuffledRight = [...formattedPairs]
                .sort(() => Math.random() - 0.5)
                .map((pair, index) => ({
                    displayId: `right-${index}`, // Unique ID for display
                    originalId: pair.id, // Original pair ID for matching
                    text: pair.right
                }))

            // Combine left (in order) with shuffled right
            setPairs(formattedPairs.map((pair, index) => ({
                id: pair.id,
                left: pair.left,
                right: pair.right,
                rightShuffled: shuffledRight[index]
            })))
        } catch (error) {
            console.error('Error fetching word pairs:', error)
            alert('Error loading game content. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleLeftClick = (pairId) => {
        if (matchedPairs.includes(pairId)) return
        setSelectedLeft(pairId)
        setIncorrectPairs([])
    }

    const handleRightClick = (rightItem) => {
        if (matchedPairs.includes(rightItem.originalId)) return
        setSelectedRight(rightItem)
        setIncorrectPairs([])
    }

    useEffect(() => {
        if (selectedLeft !== null && selectedRight !== null) {
            setAttempts(attempts + 1)

            // Check if the selected pair is correct
            // selectedLeft is the original pair ID
            // selectedRight.originalId is the original pair ID of the shuffled right item
            if (selectedLeft === selectedRight.originalId) {
                // Correct match
                setMatchedPairs([...matchedPairs, selectedLeft])
                setScore(score + 10)

                // Check if game is complete
                if (matchedPairs.length + 1 === pairs.length) {
                    setTimeout(async () => {
                        const finalScore = Math.round(((matchedPairs.length + 1) / (attempts + 1)) * 100)
                        await completeGameSession(sessionId, finalScore)
                        onComplete?.(finalScore)
                    }, 1000)
                }
            } else {
                // Incorrect match
                setIncorrectPairs([selectedLeft, selectedRight.originalId])
            }

            // Reset selection after a delay
            setTimeout(() => {
                setSelectedLeft(null)
                setSelectedRight(null)
            }, 1000)
        }
    }, [selectedLeft, selectedRight])

    const handleReset = () => {
        setMatchedPairs([])
        setSelectedLeft(null)
        setSelectedRight(null)
        setIncorrectPairs([])
        setScore(0)
        setAttempts(0)
        initializeGame()
    }

    const getCardClass = (id, side) => {
        const isMatched = matchedPairs.includes(id)
        const isSelected = side === 'left'
            ? selectedLeft === id
            : selectedRight?.originalId === id
        const isIncorrect = incorrectPairs.includes(id)

        let baseClass = 'answer-card text-center font-medium text-lg min-h-[80px] flex items-center justify-center'

        if (isMatched) return `${baseClass} answer-card-correct cursor-not-allowed opacity-50`
        if (isIncorrect) return `${baseClass} answer-card-incorrect`
        if (isSelected) return `${baseClass} answer-card-selected`

        return baseClass
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading game...</p>
            </div>
        )
    }

    if (pairs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No content available for this game.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-word-match bg-clip-text text-transparent">
                        Word Match Game
                    </h2>
                    <p className="text-gray-600 mt-1">Ghép các từ tiếng Anh với nghĩa tiếng Việt</p>
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
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Chơi lại</span>
                    </button>
                </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className="text-3xl font-bold text-purple-600">{score}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Đã ghép</p>
                    <p className="text-3xl font-bold text-green-600">{matchedPairs.length}/{pairs.length}</p>
                </div>
                <div className="card text-center">
                    <p className="text-sm text-gray-600">Lượt thử</p>
                    <p className="text-3xl font-bold text-blue-600">{attempts}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${(matchedPairs.length / pairs.length) * 100}%` }}
                />
            </div>

            {/* Game Board */}
            <div className="grid grid-cols-2 gap-6">
                {/* Left Column - English */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Tiếng Anh</h3>
                    {pairs.map((pair) => (
                        <div
                            key={`left-${pair.id}`}
                            onClick={() => handleLeftClick(pair.id)}
                            className={getCardClass(pair.id, 'left')}
                        >
                            {pair.left}
                            {matchedPairs.includes(pair.id) && (
                                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Column - Vietnamese (Shuffled) */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Tiếng Việt</h3>
                    {pairs.map((pair) => (
                        <div
                            key={pair.rightShuffled.displayId}
                            onClick={() => handleRightClick(pair.rightShuffled)}
                            className={getCardClass(pair.rightShuffled.originalId, 'right')}
                        >
                            {pair.rightShuffled.text}
                            {matchedPairs.includes(pair.rightShuffled.originalId) && (
                                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Instructions */}
            <div className="card bg-purple-50 border border-purple-200">
                <p className="text-sm text-purple-800">
                    <strong>Hướng dẫn:</strong> Nhấp vào một từ tiếng Anh, sau đó nhấp vào nghĩa tiếng Việt tương ứng để ghép cặp.
                </p>
            </div>

            {/* Completion Message */}
            {matchedPairs.length === pairs.length && (
                <div className="card bg-gradient-word-match text-white text-center py-8 animate-bounce">
                    <Trophy className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Chúc mừng! 🎉</h3>
                    <p className="text-lg">Bạn đã hoàn thành trò chơi với {attempts} lượt thử!</p>
                    <p className="text-sm mt-2 opacity-90">Điểm số: {score}</p>
                </div>
            )}
        </div>
    )
}
