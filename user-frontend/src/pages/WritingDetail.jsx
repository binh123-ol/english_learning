import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { ArrowLeft, Calendar, FileText, CheckCircle2, AlertCircle, Sparkles, Loader2, Info, PenTool } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function WritingDetail() {
  const { evaluationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDetail()
  }, [evaluationId])

  const fetchDetail = async () => {
    try {
      const response = await axios.get(`/ai/writing/${evaluationId}`)
      const data = response.data
      
      // Parse the analysisJson back to an object for consistent display
      if (data.analysisJson) {
        data.analysis = JSON.parse(data.analysisJson)
      }
      
      setEvaluation(data)
    } catch (err) {
      console.error('Error fetching writing detail:', err)
      setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải chi tiết bài viết...</p>
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Đã có lỗi xảy ra</h3>
        <p className="text-gray-500 mb-8">{error || 'Không tìm thấy thông tin bài viết.'}</p>
        <button 
          onClick={() => navigate('/dashboard/writing-practice/history')}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md active:transform active:scale-95"
        >
          Quay lại lịch sử
        </button>
      </div>
    )
  }

  const analysis = evaluation.analysis || {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 border-gray-100">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/dashboard/writing-practice/history')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Lịch sử bài viết
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-widest rounded-lg border border-primary-100 shadow-sm">
              {evaluation.level || 'General'}
            </span>
            <span className="text-sm text-gray-400 font-bold flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg">
              <Calendar className="w-4 h-4" />
              {formatDate(evaluation.createdAt)}
            </span>
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tight">
            {evaluation.topic || 'Reviewing Your Writing'}
          </h1>
        </div>

        <div className="bg-primary-600 text-white p-6 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-w-[140px] transform hover:scale-105 transition-transform cursor-default">
          <div className="text-5xl font-black leading-none mb-1">
            {evaluation.score ? evaluation.score.toFixed(1) : 'N/A'}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Final Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Original Text & Analysis */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Original Content
            </h2>
            
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary-100 rounded-full opacity-50"></div>
              <div className="text-xl leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                {analysis.segments ? (
                  analysis.segments.map((seg, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "rounded px-1.5 py-0.5 inline-block mb-1",
                        seg.type === 'error' && "bg-red-50 text-red-700 border-b-2 border-red-200",
                        seg.type === 'warning' && "bg-yellow-50 text-yellow-700 border-b-2 border-yellow-200",
                        seg.type === 'good' && "bg-green-50 text-green-700 border-b-2 border-green-200",
                        !seg.type && "bg-gray-50 text-gray-600"
                      )}
                      title={seg.feedback}
                    >
                      {seg.text}
                    </span>
                  ))
                ) : (
                  evaluation.content
                )}
              </div>
            </div>
          </section>

          {analysis.segments && analysis.segments.filter(s => s.type === 'error' || s.type === 'warning').length > 0 && (
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Detailed Improvements
              </h2>
              <div className="space-y-4">
                {analysis.segments
                  .filter(s => s.type === 'error' || s.type === 'warning')
                  .map((seg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "p-5 rounded-2xl flex items-start gap-4 transition-all hover:translate-x-1",
                        seg.type === 'error' ? "bg-red-50 border-l-4 border-red-500" : "bg-yellow-50 border-l-4 border-yellow-500"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl mt-0.5",
                        seg.type === 'error' ? "bg-red-100" : "bg-yellow-100"
                      )}>
                        {seg.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Info className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="space-y-1.5">
                        <div className="font-bold text-gray-400 line-through text-sm">"{seg.text}"</div>
                        {seg.correction && (
                          <div className="font-black text-gray-900 text-lg flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            {seg.correction}
                          </div>
                        )}
                        <p className="text-gray-600 text-sm leading-relaxed">{seg.feedback}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Overall AI Feedback */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-900/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-wider italic text-white">AI Tutor Insight</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed font-medium italic">
                  "{evaluation.feedback || "Great effort! Your writing shows good progress. Focus on refining your grammar and expanding your vocabulary for higher scores."}"
                </p>
                
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Analysis Done</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full">
                    English Admin AI
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100 flex items-center gap-5 group hover:bg-primary-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/writing-practice')}>
            <div className="p-4 bg-white rounded-2xl shadow-sm text-primary-600 group-hover:scale-110 transition-transform">
              <PenTool className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-primary-900 uppercase tracking-tight">Keep Practicing</h3>
              <p className="text-sm text-primary-700 font-medium">Write another essay to improve your skills.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
