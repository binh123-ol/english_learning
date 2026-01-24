import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ChatBox from './ChatBox'

export default function ChatBotButton() {
    const location = useLocation()
    const [isVisible, setIsVisible] = useState(true)
    const [isChatOpen, setIsChatOpen] = useState(false)

    // Hide on certain routes (exam, game playing pages)
    useEffect(() => {
        const hiddenRoutes = ['/dashboard/exams/', '/dashboard/games/play', '/exam', '/game']
        const shouldHide = hiddenRoutes.some(route => location.pathname.includes(route))
        setIsVisible(!shouldHide)
    }, [location])

    const handleClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const newState = !isChatOpen
        console.log('🔵 Button clicked! Current:', isChatOpen, '→ New:', newState)
        setIsChatOpen(newState)
    }

    const handleClose = () => {
        console.log('🔴 Closing chat')
        setIsChatOpen(false)
    }

    useEffect(() => {
        console.log('📊 State changed - isChatOpen:', isChatOpen)
    }, [isChatOpen])

    if (!isVisible) return null

    return (
        <>
            <ChatBox isOpen={isChatOpen} onClose={handleClose} />

            <div className="fixed bottom-6 right-6 z-[90]">
                <button
                    type="button"
                    onClick={handleClick}
                    className="group relative w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce-slow"
                    aria-label="Chat với AI"
                >
                    <span className="text-3xl">🤖</span>

                    {!isChatOpen && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}

                    <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {isChatOpen ? 'Đóng chat' : 'Luyện nói với AI'}
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                </button>

                {!isChatOpen && (
                    <div className="absolute inset-0 rounded-full bg-purple-400 opacity-30 animate-ping pointer-events-none"></div>
                )}
            </div>
        </>
    )
}
