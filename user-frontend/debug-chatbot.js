// Debug script - Run in browser console (F12)

console.log('=== Chatbot Debug ===')

// Check if ChatBotButton exists
const chatButton = document.querySelector('[aria-label="Chat với AI"]')
console.log('Chat button found:', !!chatButton)

// Check localStorage
const user = localStorage.getItem('user')
console.log('User in localStorage:', user ? 'Yes' : 'No')
if (user) {
    try {
        const userData = JSON.parse(user)
        console.log('User ID:', userData.userId || userData.id)
    } catch (e) {
        console.error('Error parsing user data:', e)
    }
}

// Check for errors
console.log('Check the Elements tab for ChatBox component')
console.log('Check the Network tab for API calls')
console.log('Look for any red errors in Console tab')
