import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  Gamepad2,
  Clock,
  Trophy,
  TrendingUp,
  Shuffle,
  CreditCard,
  Mic,
  HelpCircle,
  Puzzle
} from 'lucide-react'

// Game type icon mapping
const getGameIcon = (gameType) => {
  const type = gameType?.toLowerCase() || ''
  switch (type) {
    case 'word match':
    case 'word_match':
    case 'wordmatch':
      return Shuffle
    case 'flashcard':
    case 'flash card':
      return CreditCard
    case 'spelling':
      return Mic
    case 'quiz':
      return HelpCircle
    case 'puzzle':
      return Puzzle
    default:
      return Gamepad2
  }
}

// Game type color mapping
const getGameColorClass = (gameType) => {
  const type = gameType?.toLowerCase() || ''
  switch (type) {
    case 'word match':
    case 'word_match':
    case 'wordmatch':
      return 'game-card-word-match'
    case 'flashcard':
    case 'flash card':
      return 'game-card-flashcard'
    case 'spelling':
      return 'game-card-spelling'
    case 'quiz':
      return 'game-card-quiz'
    case 'puzzle':
      return 'game-card-puzzle'
    default:
      return ''
  }
}

export default function Games() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchGames()
  }, [user])

  const fetchGames = async () => {
    try {
      const response = await axios.get('/games')
      setGames(response.data)
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Gamepad2 className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-bounce" />
          <p className="text-lg text-gray-600">Loading games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Luyện Tập với Game
        </h1>
        <p className="text-lg text-gray-600">
          Cải thiện kỹ năng tiếng Anh qua các trò chơi thực hành một mình
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <Trophy className="w-10 h-10 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Tổng số game</p>
          <p className="text-3xl font-bold text-purple-600">{games.length}</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <Gamepad2 className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loại game</p>
          <p className="text-3xl font-bold text-blue-600">{new Set(games.map(g => g.gameType)).size}</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Tổng XP có thể</p>
          <p className="text-3xl font-bold text-green-600">
            {games.reduce((sum, g) => sum + (g.xpReward || 0), 0)}
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const GameIcon = getGameIcon(game.gameType)
          const colorClass = getGameColorClass(game.gameType)

          return (
            <Link
              key={game.gameId}
              to={`/dashboard/games/${game.gameId}/play`}
              className={`game-card ${colorClass} group`}
            >
              {/* Icon Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl group-hover:scale-110 transition-transform">
                  <GameIcon className="w-8 h-8 text-gray-700" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Practice
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {game.level}
                  </span>
                </div>
              </div>

              {/* Game Type Badge */}
              <div className="mb-3">
                <span className="px-3 py-1 text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full">
                  {game.gameType}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {game.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                {game.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{game.estimatedDurationMinutes || 10} phút</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">{game.xpReward} XP</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Luyện tập một mình</span>
                  <span className="text-sm font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
                    Chơi ngay →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {games.length === 0 && (
        <div className="card text-center py-12">
          <Gamepad2 className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có game nào
          </h3>
          <p className="text-gray-500">
            Các game sẽ sớm được thêm vào. Hãy quay lại sau nhé!
          </p>
        </div>
      )}
    </div>
  )
}


