import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Send, MessageCircle, X, Mic } from 'lucide-react'

export default function ConversationChat() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [conversation, setConversation] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchConversation()
    fetchMessages()
  }, [conversationId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      // Fetch conversation details if needed
      // For now, we'll just fetch messages
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/conversations/${conversationId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { message: input, audioFileUrl: '' }
    const messageToAdd = input
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(`/conversations/${conversationId}/messages`, userMessage)
      // Fetch updated messages to get AI response
      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please try again.')
      setInput(messageToAdd) // Restore message on error
    } finally {
      setLoading(false)
    }
  }

  const handleEndConversation = async () => {
    if (!confirm('Are you sure you want to end this conversation?')) return
    
    try {
      await axios.post(`/conversations/${conversationId}/end`)
      navigate('/conversations')
    } catch (error) {
      console.error('Error ending conversation:', error)
      alert('Error ending conversation. Please try again.')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      <div className="card flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">AI Conversation</h2>
          <button
            onClick={handleEndConversation}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>End Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Start a conversation by sending a message below</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.messageId}
                className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.senderType === 'USER'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.pronunciationScore && (
                    <p className="text-xs mt-2 opacity-75">
                      Pronunciation: {(msg.pronunciationScore * 100).toFixed(0)}%
                    </p>
                  )}
                  {msg.feedback && (
                    <div className="mt-2 p-2 bg-white/20 rounded text-xs">
                      <p className="font-medium mb-1">Feedback:</p>
                      <p>{msg.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex space-x-2">
            <button
              type="button"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              title="Voice input (coming soon)"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to practice English..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send. AI will analyze your message and provide feedback on pronunciation, grammar, and spelling.
          </p>
        </form>
      </div>
    </div>
  )
}

