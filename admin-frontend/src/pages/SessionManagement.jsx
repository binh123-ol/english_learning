import { useEffect, useState } from 'react'
import axios from 'axios'
import { Activity, Search, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function SessionManagement() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      // Note: You may need to create a dedicated endpoint to get all sessions
      // For now, this is a placeholder
      setSessions([])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    
    try {
      await axios.delete(`/api/sessions/${sessionId}`)
      fetchSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">Loading sessions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600 mt-2">Monitor exam sessions</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Exam</th>
                <th>Status</th>
                <th>Score</th>
                <th>Started At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-600">
                    No sessions found
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.sessionId}>
                    <td className="font-medium text-gray-900">
                      {session.user?.username || 'Unknown'}
                    </td>
                    <td>{session.exam?.title || 'Unknown'}</td>
                    <td>
                      {session.finished ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Finished</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-blue-600">
                          <Activity className="w-4 h-4" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </td>
                    <td>
                      {session.finished ? (
                        <span className="font-medium">{session.finalScore?.toFixed(1) || 'N/A'}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>{new Date(session.startTime).toLocaleString()}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(session.sessionId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Total Sessions: {filteredSessions.length}</span>
        </div>
      </div>
    </div>
  )
}
