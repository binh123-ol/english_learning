import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Gamepad2, ArrowLeft } from 'lucide-react'

// Import game components
import WordMatchGame from '../components/games/WordMatchGame'
import FlashcardGame from '../components/games/FlashcardGame'
import SpellingGame from '../components/games/SpellingGame'
import QuizGame from '../components/games/QuizGame'
import PuzzleGame from '../components/games/PuzzleGame'

export default function GamePlay() {
  const { gameId } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [gameSession, setGameSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const sessionId = location.state?.gameSessionId
    if (sessionId) {
      fetchGameSession(sessionId)
    } else {
      startGame()
    }

    fetchGame()
  }, [gameId, user])

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/games/${gameId}`)
      setGame(response.data)
    } catch (error) {
      console.error('Error fetching game:', error)
    } finally {
      setLoading(false)
    }
  }

  const startGame = async () => {
    if (!user?.userId) return

    try {
      const response = await axios.post(`/games/users/${user.userId}/start/${gameId}`)
      setGameSession(response.data)
    } catch (error) {
      console.error('Error starting game:', error)
      alert('Error starting game. Please try again.')
    }
  }

  const fetchGameSession = async (sessionId) => {
    try {
      setGameSession({ gameSessionId: sessionId })
    } catch (error) {
      console.error('Error fetching game session:', error)
    }
  }

  const handleComplete = async (finalScore) => {
    if (!gameSession?.gameSessionId) {
      alert('Game session not found')
      return
    }

    try {
      await axios.post(`/games/sessions/${gameSession.gameSessionId}/complete`, null, {
        params: { score: finalScore }
      })

      // Calculate XP reward
      const xpEarned = Math.floor((game?.xpReward || 0) * (finalScore / 100))

      // Show completion message
      setTimeout(() => {
        alert(`🎉 Game completed!\n\nScore: ${finalScore}\nXP Earned: ${xpEarned} XP`)
        navigate('/dashboard/games')
      }, 2000)
    } catch (error) {
      console.error('Error completing game:', error)
      alert('Error completing game. Please try again.')
    }
  }

  const renderGameComponent = () => {
    if (!game) return null

    const gameType = game.gameType?.toLowerCase() || ''

    // Map game types to components
    switch (gameType) {
      case 'word match':
      case 'word_match':
      case 'wordmatch':
        return <WordMatchGame gameData={game} onComplete={handleComplete} />

      case 'flashcard':
      case 'flash card':
        return <FlashcardGame gameData={game} onComplete={handleComplete} />

      case 'spelling':
        return <SpellingGame gameData={game} onComplete={handleComplete} />

      case 'quiz':
        return <QuizGame gameData={game} onComplete={handleComplete} />

      case 'puzzle':
        return <PuzzleGame gameData={game} onComplete={handleComplete} />

      default:
        return (
          <div className="card text-center py-12">
            <Gamepad2 className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">
              Game type "{game.gameType}" is not yet implemented.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Available types: Word Match, Flashcard, Spelling, Quiz, Puzzle
            </p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Gamepad2 className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-bounce" />
          <p className="text-lg text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="card text-center">
          <p className="text-lg text-gray-600 mb-4">Game not found</p>
          <button
            onClick={() => navigate('/dashboard/games')}
            className="btn btn-primary"
          >
            Back to Games
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/games')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            {game.gameType}
          </span>
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            {game.level}
          </span>
        </div>
      </div>

      {/* Game Title */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900">{game.title}</h1>
        {game.description && (
          <p className="text-gray-600 mt-2">{game.description}</p>
        )}
      </div>

      {/* Game Component */}
      {renderGameComponent()}
    </div>
  )
}


