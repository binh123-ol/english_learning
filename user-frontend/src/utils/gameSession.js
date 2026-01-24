import api from '../api/axios'

/**
 * Start a new game session
 * @param {string} gameId - The game ID
 * @returns {Promise<string>} - The session ID
 */
export const startGameSession = async (gameId) => {
    try {
        const userId = localStorage.getItem('userId') || '1' // Default user for demo
        const response = await api.post(`/games/users/${userId}/start/${gameId}`)
        return response.data.gameSessionId || response.data.sessionId
    } catch (error) {
        console.error('Error starting game session:', error)

        // Provide user-friendly error messages
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            alert('⚠️ Không thể kết nối đến server.\n\nVui lòng kiểm tra:\n1. Server backend có đang chạy không?\n2. Kết nối mạng của bạn')
        } else if (error.response?.status === 404) {
            alert('⚠️ Không tìm thấy game hoặc user.\n\nVui lòng thử lại sau.')
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            alert('⚠️ Phiên đăng nhập đã hết hạn.\n\nVui lòng đăng nhập lại.')
        } else {
            alert('⚠️ Lỗi khi bắt đầu game.\n\nVui lòng thử lại sau.')
        }

        return null
    }
}

/**
 * Complete a game session with score
 * @param {string} sessionId - The session ID
 * @param {number} score - The final score
 * @returns {Promise<void>}
 */
export const completeGameSession = async (sessionId, score) => {
    if (!sessionId) {
        console.warn('No session ID provided, skipping session completion')
        return
    }

    try {
        await api.post(`/games/sessions/${sessionId}/complete?score=${score}`)
        console.log('Game session completed successfully with score:', score)
    } catch (error) {
        console.error('Error completing game session:', error)

        // Don't show alert for completion errors as the game is already done
        // Just log it for debugging
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            console.warn('Could not save game progress - server unavailable')
        }
    }
}

/**
 * Get user's game sessions
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of game sessions
 */
export const getUserGameSessions = async (userId) => {
    try {
        const response = await api.get(`/games/users/${userId}/sessions`)
        return response.data || []
    } catch (error) {
        console.error('Error fetching game sessions:', error)
        return []
    }
}
