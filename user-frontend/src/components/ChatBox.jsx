import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { X, Send, Minimize2, Maximize2 } from 'lucide-react'
import api from '../api/axios'

const GEMINI_API_KEY = 'AIzaSyAl_H0qNCBSMyFH0skpP3_WZgruFet5N-M'
// Using gemini-2.0-flash as gemini-1.5-flash is not available
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

export default function ChatBox({ isOpen, onClose }) {
    const location = useLocation()
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI English tutor. How can I help you today? 👋'
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const messagesEndRef = useRef(null)

    // Context-aware greeting
    useEffect(() => {
        if (!isOpen) return

        const fetchContext = async () => {
            try {
                const userStr = localStorage.getItem('user')
                if (!userStr) return

                const userData = JSON.parse(userStr)
                const userId = userData.userId || userData.id

                if (location.pathname.includes('/lessons')) {
                    try {
                        const res = await api.get(`/lessons/users/${userId}/recommended`)
                        const lessons = res.data || []

                        if (lessons.length > 0) {
                            const summary = lessons.slice(0, 3).map(l => `- ${l.title} (${l.level})`).join('\n')
                            setMessages([{
                                role: 'assistant',
                                content: `Hi! I see you're looking at lessons. Based on your progress, I recommend:\n\n${summary}\n\nWould you like advice on which to start with?`
                            }])
                        }
                    } catch (e) {
                        console.log('Could not fetch lessons')
                    }
                } else if (location.pathname.includes('/pronunciation-test')) {
                    try {
                        const res = await api.get(`/assessments/users/${userId}/latest`)
                        const assessment = res.data

                        if (assessment?.speakingScore) {
                            const score = assessment.speakingScore
                            const level = score >= 80 ? 'advanced' : score >= 60 ? 'intermediate' : 'beginner'

                            setMessages([{
                                role: 'assistant',
                                content: `Hi! I see you're practicing pronunciation. Based on your speaking score (${score.toFixed(0)}%), I've prepared ${level}-level exercises.\n\nWould you like practice texts?`
                            }])
                        }
                    } catch (e) {
                        console.log('Could not fetch assessment')
                    }
                }
            } catch (error) {
                console.error('Error fetching context:', error)
            }
        }

        fetchContext()
    }, [isOpen, location.pathname])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        const userInput = input
        setInput('')
        setIsLoading(true)

        try {
            let systemPrompt = "You are an English tutor helping students practice speaking and writing English. Be friendly, encouraging, and correct any mistakes gently."

            if (location.pathname.includes('/lessons')) {
                systemPrompt += "\n\nThe user is browsing lessons. Help them choose which lessons to study and in what order."
            } else if (location.pathname.includes('/pronunciation-test')) {
                systemPrompt += "\n\nThe user is practicing pronunciation. Provide practice texts and pronunciation tips."
            }

            console.log('Sending request to Gemini:', GEMINI_API_URL)

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\nUser: ${userInput}\n\nAssistant:`
                        }]
                    }]
                })
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error('Gemini API Error Body:', errorBody)
                throw new Error(`API Error: ${response.status} - ${errorBody}`)
            }

            const data = await response.json()

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                const aiMessage = {
                    role: 'assistant',
                    content: data.candidates[0].content.parts[0].text
                }
                setMessages(prev => [...prev, aiMessage])
            } else {
                throw new Error('Invalid response from AI')
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please check the console for details.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed bottom-24 right-6 z-[9999] transition-all duration-300 w-96">
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${isMinimized ? 'h-16' : 'h-[600px]'} transition-all duration-300`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                            🤖
                        </div>
                        <div className="text-white">
                            <h3 className="font-bold">AI English Tutor</h3>
                            <p className="text-xs opacity-90">Context-Aware</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="h-[calc(600px-140px)] overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
