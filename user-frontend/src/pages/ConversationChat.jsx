import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Send, X, Mic, Volume2, Languages, RotateCcw, StopCircle, CheckCircle2, Award } from 'lucide-react'

export default function ConversationChat() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [confidenceDetails, setConfidenceDetails] = useState([]) // [{word, status}]
  const [showSummary, setShowSummary] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const [aiReviewFeedback, setAiReviewFeedback] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchMessages()
    initSpeechRecognition()
  }, [conversationId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages, interimTranscript])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let currentInterim = ''
      let finalTranscript = ''
      let newDetails = []

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i]
        const transcriptText = result[0].transcript
        const confidence = result[0].confidence

        if (result.isFinal) {
          finalTranscript += transcriptText
          // Process confidence for coloring
          const words = transcriptText.trim().split(/\s+/)
          words.forEach(word => {
            let status = 'correct'
            if (confidence < 0.6) status = 'incorrect'
            else if (confidence < 0.85) status = 'fair'
            newDetails.push({ word, status })
          })
        } else {
          currentInterim += transcriptText
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript)
        setConfidenceDetails(prev => [...prev, ...newDetails])
      }
      setInterimTranscript(currentInterim)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      setIsRecording(false)
      if (event.error === 'no-speech') {
        setSpeechError('No speech was detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        setSpeechError('Microphone access is denied. Please enable it in your browser settings.')
      } else {
        setSpeechError('An error occurred with speech recognition. Please try again.')
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
  }

  const toggleRecording = () => {
    setSpeechError(null)
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      setTranscript('')
      setInterimTranscript('')
      setConfidenceDetails([])
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
      } catch (e) {
        setSpeechError('Could not start microphone. Please refresh and try again.')
      }
    }
  }

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8 // Slightly slower for clarity
    window.speechSynthesis.speak(utterance)
  }

  const handleGetAIFeedback = async () => {
    if (!transcript) return
    setIsAnalyzing(true)
    setAiReviewFeedback('')
    try {
      const response = await api.post('/speech/analyze', {
        text: transcript,
        details: confidenceDetails
      })
      setAiReviewFeedback(response.data.feedback)
    } catch (error) {
      console.error('Error getting AI feedback:', error)
      setAiReviewFeedback('Không thể kết nối với AI để lấy nhận xét. Vui lòng thử lại.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSend = async (textToSend) => {
    const messageText = textToSend || transcript || input
    if (!messageText.trim() || loading) return

    setLoading(true)
    setAiReviewFeedback('')
    setInput('')
    setTranscript('')
    setInterimTranscript('')

    try {
      // For now we send as text. Audio file upload can be added if needed for Vosk refinement.
      await api.post(`/conversations/${conversationId}/messages`, {
        message: messageText,
        audioFileUrl: '',
        pronunciationDetails: confidenceDetails
      })
      await fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Server error';
      console.error('Detailed error:', error.response?.data);
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false)
    }
  }

  const handleSpeak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const toggleTranslate = (msgId) => {
    setMessages(prev => prev.map(msg => {
      if (msg.messageId === msgId) {
        return { ...msg, showTranslation: !msg.showTranslation }
      }
      return msg
    }))
  }

  const getTranslation = (feedback) => {
    if (feedback && feedback.startsWith('TRANSLATION:')) {
      return feedback.replace('TRANSLATION:', '')
    }
    return null
  }

  const getPronunciationDetails = (feedback) => {
    try {
      if (feedback && feedback.startsWith('[')) {
        return JSON.parse(feedback) // List of {word, status}
      }
    } catch (e) { }
    return null
  }

  const handleEndConversation = async () => {
    if (!confirm('Are you sure you want to end this conversation and see your evaluation?')) return

    try {
      await api.post(`/conversations/${conversationId}/end`)
      setShowSummary(true)
    } catch (error) {
      console.error('Error ending conversation:', error)
    }
  }

  if (showSummary) {
    const userMessages = messages.filter(m => m.senderType === 'USER' && m.pronunciationScore)
    const avgScore = userMessages.length > 0
      ? userMessages.reduce((acc, m) => acc + parseFloat(m.pronunciationScore), 0) / userMessages.length
      : 0

    return (
      <div className="max-w-2xl mx-auto mt-10 animate-fadeIn">
        <div className="card text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <Award className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Session Complete!</h2>
          <p className="text-gray-600">You've finished your speaking practice session.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 uppercase font-bold">Total Sentences</p>
              <p className="text-2xl font-bold text-primary-600">{messages.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 uppercase font-bold">Avg Pronunciation</p>
              <p className="text-2xl font-bold text-green-600">{(avgScore * 100).toFixed(0)}%</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/conversations')}
            className="w-full btn btn-primary py-3"
          >
            Back to Conversations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto p-4">
      <div className="card flex-1 flex flex-col overflow-hidden border-none shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold">Speaking Practice</h2>
              <p className="text-xs opacity-80">{messages.length}/15 messages</p>
            </div>
          </div>
          <button
            onClick={handleEndConversation}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="End Session"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50">
          {messages.map((msg) => {
            const translation = getTranslation(msg.feedback)
            const details = getPronunciationDetails(msg.feedback)

            return (
              <div
                key={msg.messageId}
                className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`max-w-[85%] group`}>
                  <div
                    className={`relative p-4 rounded-2xl shadow-sm ${msg.senderType === 'USER'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                      }`}
                  >
                    {/* Message Content */}
                    <div className="text-lg leading-relaxed">
                      {details ? (
                        <div className="flex flex-wrap gap-x-1">
                          {details.map((d, i) => (
                            <span
                              key={i}
                              className={
                                d.status === 'correct' ? 'text-white' :
                                  d.status === 'fair' ? 'text-yellow-200' : 'text-red-300 italic underline decoration-dotted'
                              }
                            >
                              {d.word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {msg.showTranslation && translation ? translation : msg.content}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className={`mt-3 pt-2 border-t flex items-center space-x-4 ${msg.senderType === 'USER' ? 'border-white/20' : 'border-gray-100'
                      }`}>
                      <button
                        onClick={() => handleSpeak(msg.content)}
                        className="hover:scale-110 transition-transform opacity-70 hover:opacity-100"
                        title="Read aloud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {translation && (
                        <button
                          onClick={() => toggleTranslate(msg.messageId)}
                          className={`hover:scale-110 transition-transform opacity-70 hover:opacity-100 ${msg.showTranslation ? 'text-yellow-400 font-bold' : ''}`}
                          title="Translate"
                        >
                          <Languages className="w-4 h-4" />
                        </button>
                      )}

                      {msg.pronunciationScore && (
                        <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                          {(msg.pronunciationScore * 100).toFixed(0)}% accuracy
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Live Transcription Overlay */}
          {(isRecording || interimTranscript || transcript) && (
            <div className="flex justify-end animate-pulse">
              <div className="max-w-[85%] bg-primary-100 border-2 border-primary-300 p-4 rounded-2xl rounded-br-none shadow-lg">
                <p className="text-primary-800 italic text-lg">
                  {transcript}
                  <span className="text-primary-500">{interimTranscript}</span>
                  <span className="inline-block w-1.5 h-5 bg-primary-600 animate-bounce ml-1"></span>
                </p>
                {confidenceDetails.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {confidenceDetails.map((d, i) => (
                      <span
                        key={i}
                        className={
                          d.status === 'correct' ? 'text-green-600' :
                            d.status === 'fair' ? 'text-yellow-600' : 'text-red-600 underline decoration-dotted'
                        }
                      >
                        {d.word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <div className="p-6 bg-white border-t">
          {speechError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-pulse flex items-center justify-between">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="p-1 hover:bg-red-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {isRecording ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-6">
                <button
                  onClick={toggleRecording}
                  className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-700 animate-pulse transition-all"
                >
                  <StopCircle className="w-8 h-8" />
                </button>
              </div>
              <p className="text-red-600 font-semibold flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-ping"></span>
                Recording... speak clearly in English
              </p>
            </div>
          ) : (transcript ? (
            <div className="flex flex-col space-y-4 animate-fadeIn">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs font-bold uppercase">Review your speech (click terms to hear):</p>
                  <button
                    onClick={handleGetAIFeedback}
                    disabled={isAnalyzing}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    <Languages className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Get AI Advice (VN)'}</span>
                  </button>
                </div>

                {confidenceDetails.length > 0 ? (
                  <div className="flex flex-wrap gap-x-1 text-xl font-medium">
                    {confidenceDetails.map((d, i) => (
                      <span
                        key={i}
                        onClick={() => speakWord(d.word)}
                        className={`cursor-pointer hover:bg-white px-1 rounded transition-colors ${d.status === 'correct' ? 'text-green-600' :
                          d.status === 'fair' ? 'text-yellow-600' : 'text-red-600 underline decoration-dotted'
                          }`}
                        title={`Click to hear "${d.word}"`}
                      >
                        {d.word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xl text-gray-800">{transcript}</p>
                )}

                {aiReviewFeedback && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl text-slate-700 shadow-sm animate-fadeIn">
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-indigo-100/50">
                      <span className="text-xl">💡</span>
                      <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-xs">AI Insight (Tiếng Việt)</h4>
                    </div>
                    <div className="text-sm leading-relaxed space-y-2 prose prose-sm max-w-none">
                      {aiReviewFeedback.split('\n').map((line, idx) => (
                        <p key={idx} className={line.startsWith('-') ? 'pl-4 -indent-4' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={toggleRecording}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={() => handleSend(transcript)}
                  disabled={loading}
                  className="flex-[2] py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <span className="animate-spin text-2xl">🌀</span> : <CheckCircle2 className="w-5 h-5" />}
                  <span>Confirm & Send to AI</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleRecording}
                className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 hover:scale-110 transition-all group"
                title="Talk to AI"
              >
                <Mic className="w-6 h-6 group-hover:animate-bounce" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Or type your message here..."
                  className="w-full px-6 py-4 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:bg-primary-50 rounded-full disabled:opacity-30"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

