import { useState, useEffect } from 'react'
import api from '../api/axios'
import { Gamepad2, Plus, Edit, Trash2, Users, Trophy, Clock, FileEdit } from 'lucide-react'
import GameContentEditor from '../components/GameContentEditor'

export default function GameManagement() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [rooms, setRooms] = useState([])
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomFormData, setRoomFormData] = useState({
    roomName: '',
    maxPlayers: 4
  })
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [showPlayersModal, setShowPlayersModal] = useState(false)
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [editingGameContent, setEditingGameContent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    gameType: 'WORD_MATCH',
    level: 'BEGINNER',
    description: '',
    xpReward: 5,
    difficultyLevel: 'EASY',
    estimatedDurationMinutes: 10,
    isActive: true
  })

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await api.get('/games')
      setGames(response.data)
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingGame) {
        await api.put(`/games/${editingGame.gameId}`, formData)
      } else {
        await api.post('/games', formData)
      }
      setShowForm(false)
      setEditingGame(null)
      resetForm()
      fetchGames()
    } catch (error) {
      console.error('Error saving game:', error)
      alert('Error saving game. Please try again.')
    }
  }

  const handleDelete = async (gameId) => {
    if (!confirm('Are you sure you want to delete this game?')) return

    try {
      await api.delete(`/games/${gameId}`)
      fetchGames()
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Error deleting game. Please try again.')
    }
  }

  const handleEdit = (game) => {
    setEditingGame(game)
    setFormData({
      title: game.title || '',
      gameType: game.gameType || 'WORD_MATCH',
      level: game.level || 'BEGINNER',
      description: game.description || '',
      xpReward: game.xpReward || 5,
      difficultyLevel: game.difficultyLevel || 'EASY',
      estimatedDurationMinutes: game.estimatedDurationMinutes || 10,
      isActive: game.isActive !== false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      gameType: 'WORD_MATCH',
      level: 'BEGINNER',
      description: '',
      xpReward: 5,
      difficultyLevel: 'EASY',
      estimatedDurationMinutes: 10,
      isActive: true
    })
  }

  const handleManageGame = async (game) => {
    setSelectedGame(game)
    await fetchRooms(game.gameId)
    setShowRoomModal(true)
  }

  const fetchRooms = async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/rooms`)
      setRooms(response.data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setRooms([])
    }
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/games/${selectedGame.gameId}/rooms`, roomFormData)
      await fetchRooms(selectedGame.gameId)
      setRoomFormData({ roomName: '', maxPlayers: 4 })
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Error creating room')
    }
  }

  const handleViewPlayers = async (room) => {
    setSelectedRoom(room)
    await fetchPlayers(room.roomId)
    setShowPlayersModal(true)
  }

  const fetchPlayers = async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}/players`)
      // Sort by rank position
      const sortedPlayers = response.data.sort((a, b) => {
        if (a.rankPosition && b.rankPosition) {
          return a.rankPosition - b.rankPosition
        }
        return 0
      })
      setPlayers(sortedPlayers)
    } catch (error) {
      console.error('Error fetching players:', error)
      setPlayers([])
    }
  }

  const handleEditContent = (game) => {
    setEditingGameContent(game)
    setShowContentEditor(true)
  }

  if (loading) {
    return <div className="text-center py-12">Loading games...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game Management</h1>
          <p className="text-gray-600 mt-2">Manage language learning games</p>
        </div>
        <button
          onClick={() => {
            setEditingGame(null)
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Game</span>
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingGame ? 'Edit Game' : 'Create New Game'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Game Type *</label>
                <select
                  value={formData.gameType}
                  onChange={(e) => setFormData({ ...formData, gameType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="WORD_MATCH">Word Match</option>
                  <option value="FLASHCARD">Flashcard</option>
                  <option value="SPELLING">Spelling</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="PUZZLE">Puzzle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="ELEMENTARY">Elementary</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="UPPER_INTERMEDIATE">Upper Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                <input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                {editingGame ? 'Update Game' : 'Create Game'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingGame(null)
                  resetForm()
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.gameId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{game.title}</div>
                    <div className="text-sm text-gray-500">{game.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {game.gameType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {game.level}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {game.xpReward} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${game.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {game.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditContent(game)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Edit Content"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleManageGame(game)}
                        className="text-green-600 hover:text-green-900"
                        title="Manage Rooms"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(game)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Game Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.gameId)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Game"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Management Modal */}
      {showRoomModal && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Manage Rooms: {selectedGame.title}
              </h2>
              <button
                onClick={() => {
                  setShowRoomModal(false)
                  setSelectedGame(null)
                  setRooms([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Create New Room</h3>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Room Name"
                  value={roomFormData.roomName}
                  onChange={(e) => setRoomFormData({ ...roomFormData, roomName: e.target.value })}
                  className="input"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Players"
                  value={roomFormData.maxPlayers}
                  onChange={(e) => setRoomFormData({ ...roomFormData, maxPlayers: parseInt(e.target.value) })}
                  className="input"
                  min="2"
                  max="10"
                  required
                />
                <button type="submit" className="btn btn-primary">Create Room</button>
              </div>
            </form>

            <div className="space-y-3">
              {rooms.map((room) => (
                <div key={room.roomId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold">{room.roomName}</h4>
                      <div className="mt-2 text-sm text-gray-600 flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{room.currentPlayers}/{room.maxPlayers} players</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${room.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                          room.status === 'PLAYING' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {room.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewPlayers(room)}
                      className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>View Rankings</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Players & Rankings Modal */}
      {showPlayersModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Rankings: {selectedRoom.roomName}
              </h2>
              <button
                onClick={() => {
                  setShowPlayersModal(false)
                  setSelectedRoom(null)
                  setPlayers([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {players.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No players yet</p>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.roomPlayerId}
                    className={`border rounded-lg p-4 ${player.rankPosition === 1 ? 'bg-yellow-50 border-yellow-300' :
                      player.rankPosition === 2 ? 'bg-gray-50 border-gray-300' :
                        player.rankPosition === 3 ? 'bg-orange-50 border-orange-300' :
                          'bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${player.rankPosition === 1 ? 'bg-yellow-400 text-yellow-900' :
                          player.rankPosition === 2 ? 'bg-gray-400 text-gray-900' :
                            player.rankPosition === 3 ? 'bg-orange-400 text-orange-900' :
                              'bg-blue-400 text-blue-900'
                          }`}>
                          {player.rankPosition || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold">{player.user?.username || 'Unknown'}</h4>
                          <p className="text-sm text-gray-600">{player.user?.email || ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold">{player.score.toFixed(2)}</span>
                          </span>
                          {player.completionTimeSeconds && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span>{player.completionTimeSeconds}s</span>
                            </span>
                          )}
                          <span className="text-red-600">Errors: {player.mistakesCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Editor Modal */}
      {showContentEditor && editingGameContent && (
        <GameContentEditor
          game={editingGameContent}
          onClose={() => {
            setShowContentEditor(false)
            setEditingGameContent(null)
          }}
        />
      )}
    </div>
  )
}

