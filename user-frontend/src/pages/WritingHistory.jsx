import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { History, ArrowLeft, Calendar, FileText, ChevronRight, Search, Loader2 } from 'lucide-react'

export default function WritingHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/ai/writing/history/${user.userId}`)
      setEvaluations(response.data)
    } catch (err) {
      console.error('Error fetching writing history:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvaluations = evaluations.filter(ev => 
    ev.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate('/dashboard/writing-practice')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại luyện viết
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <History className="w-8 h-8 text-primary-600" />
            Lịch sử bài viết
          </h1>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Đang tải lịch sử bài viết...</p>
        </div>
      ) : filteredEvaluations.length > 0 ? (
        <div className="grid gap-4">
          {filteredEvaluations.map((ev) => (
            <div 
              key={ev.evaluationId}
              onClick={() => navigate(`/dashboard/writing-practice/history/${ev.evaluationId}`)}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-primary-100 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded">
                      {ev.level || 'General'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ev.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors mb-2 line-clamp-1">
                    {ev.topic || 'Bài viết không tiêu đề'}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {ev.content}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary-600">
                      {ev.score ? ev.score.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Điểm số</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-400 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có bài viết nào</h3>
          <p className="text-gray-500 text-sm mb-6">Hãy bắt đầu luyện viết để nhận được phản hồi từ AI.</p>
          <button 
            onClick={() => navigate('/dashboard/writing-practice')}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md active:transform active:scale-95"
          >
            Luyện viết ngay
          </button>
        </div>
      )}
    </div>
  )
}
