import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, Plus } from 'lucide-react'

export default function Conversations() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newConversation, setNewConversation] = useState({
    topic: '',
    difficultyLevel: 'BEGINNER'
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchConversations()
  }, [user])

  const fetchConversations = async () => {
    if (!user?.userId) return
    
    try {
      const response = await axios.get(`/conversations/users/${user.userId}`)
      setConversations(response.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartConversation = async (e) => {
    e.preventDefault()
    if (!user?.userId) return
    
    try {
      const response = await axios.post(`/conversations/users/${user.userId}/start`, newConversation)
      navigate(`/conversations/${response.data.conversationId}`)
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Error starting conversation. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading conversations...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Conversations</h1>
          <p className="text-gray-600 mt-2">Practice speaking English with AI</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Conversation</span>
        </button>
      </div>

      {showNewForm && (
        <form onSubmit={handleStartConversation} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={newConversation.topic}
              onChange={(e) => setNewConversation({...newConversation, topic: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Daily activities, Travel, Food..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={newConversation.difficultyLevel}
              onChange={(e) => setNewConversation({...newConversation, difficultyLevel: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="ELEMENTARY">Elementary</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="UPPER_INTERMEDIATE">Upper Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
            >
              Start Conversation
            </button>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conversations.map((conversation) => (
          <Link
            key={conversation.conversationId}
            to={`/conversations/${conversation.conversationId}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                conversation.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {conversation.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {conversation.topic || 'General Conversation'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Level: {conversation.difficultyLevel}
            </p>
            <p className="text-sm text-gray-500">
              {conversation.messagesCount} messages • {conversation.xpEarned} XP
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

