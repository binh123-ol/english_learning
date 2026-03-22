import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { PenTool, Info, CheckCircle2, AlertCircle, Sparkles, ChevronRight, History } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function WritingPractice() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setIsAnalyzing(true)
    setError(null)
    try {
      const response = await axios.post(`/ai/writing/evaluate?userId=${user.userId}`, { text })
      setResult(response.data)
    } catch (err) {
      console.error('Error analyzing writing:', err)
      setResult(null) // Clear previous results on error
      const serverMsg = err.response?.data?.message || err.response?.data?.error
      setError(serverMsg ? `Lỗi: ${serverMsg}` : 'Đã có lỗi xảy ra khi phân tích bài viết. Vui lòng thử lại sau.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSegmentColor = (type) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-b-2 border-red-400 cursor-help'
      case 'improvement': return 'bg-yellow-100 text-yellow-800 border-b-2 border-yellow-400 cursor-help'
      default: return 'text-gray-800'
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <PenTool className="w-8 h-8 text-primary-600" />
            </div>
            AI Writing Lab
          </h1>
          <p className="text-gray-500 mt-2">Viết bài luận của bạn và nhận phản hồi tức thì từ AI giáo viên.</p>
        </div>
        <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
          <History className="w-5 h-5" />
          Lịch sử bài viết
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-0 overflow-hidden border-2 border-transparent focus-within:border-primary-500 transition-all shadow-lg hover:shadow-xl group">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Người viết: {user?.username}</span>
              <span className="text-xs text-gray-400">{text.length} ký tự</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập bài viết Tiếng Anh của bạn tại đây (ít nhất 20 từ để có kết quả tốt nhất)..."
              className="w-full min-h-[400px] p-6 text-lg leading-relaxed resize-none focus:outline-none placeholder:text-gray-300"
              disabled={isAnalyzing}
            />
            <div className="p-4 bg-white border-t flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all shadow-md active:scale-95",
                  isAnalyzing || !text.trim() 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "bg-primary-600 hover:bg-primary-700 hover:shadow-lg"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Phân tích bài viết
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Info & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Cách hoạt động
            </h3>
            <ul className="space-y-4 text-sm text-primary-50">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                AI nhận diện chủ đề và ngữ cảnh của bạn.
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                Đánh giá theo khung tham chiếu châu Âu (CEFR).
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                Tìm lỗi sai và các điểm có thể viết hay hơn.
              </li>
            </ul>
          </div>

          <div className="card bg-white p-6 shadow-md">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Mẹo viết hay
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-lg">
                Sử dụng các trạng từ chỉ mức độ để bài viết sinh động hơn.
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                Đảm bảo các câu có sự kết nối (cohesion) bằng từ nối.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
          {!result.segments && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
              Cảnh báo: Phản hồi từ AI không đầy đủ dữ liệu chi tiết.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultMetric label="Chủ đề" value={result.topic || 'Không xác định'} icon={<Info className="w-5 h-5 text-blue-500" />} />
            <ResultMetric label="Trình độ" value={result.level || 'N/A'} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} highlight />
            <ResultMetric label="Điểm số" value={result.score !== undefined ? `${result.score}/10` : 'N/A'} icon={<Trophy className="w-5 h-5 text-yellow-500" />} />
          </div>

          <div className="card p-8 bg-white shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Phân tích chi tiết</h2>
            
            <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Nhận xét tổng quát
              </h3>
              <p className="text-blue-800 leading-relaxed">{result.feedback || 'Không có nhận xét tổng quát.'}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Original with Highlights */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Văn bản gốc & Chú thích
                </h3>
                <div className="prose prose-lg max-w-none text-gray-800 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm font-serif leading-loose min-h-[300px]">
                  {result.segments?.map((seg, i) => (
                    <span 
                      key={i} 
                      className={cn(
                        "transition-all duration-300",
                        seg.type === 'error' && 'bg-red-50 border-b-2 border-red-300 text-red-900 px-0.5',
                        seg.type === 'improvement' && 'bg-yellow-50 border-b-2 border-yellow-300 text-yellow-900 px-0.5'
                      )}
                      title={seg.explanation}
                    >
                      {seg.text}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2">
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span>Lỗi sai cần sửa</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span>Điểm cần cải thiện</span>
                   </div>
                </div>
              </div>

              {/* Right Column: Detailed Corrections List */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  Danh sách Gợi ý sửa lỗi
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.segments?.filter(seg => seg.type !== 'normal').length === 0 ? (
                    <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="font-bold text-green-800">Tuyệt vời! Không tìm thấy lỗi nào.</p>
                      <p className="text-sm text-green-600">Bài viết của bạn rất tốt và mạch lạc.</p>
                    </div>
                  ) : (
                    result.segments?.filter(seg => seg.type !== 'normal').map((seg, i) => (
                      <div key={i} className={cn(
                        "p-5 rounded-2xl border-l-4 shadow-sm animate-in slide-in-from-right-4 duration-500",
                        seg.type === 'error' ? "bg-red-50/50 border-red-400" : "bg-yellow-50/50 border-yellow-400"
                      )}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                            seg.type === 'error' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {seg.type === 'error' ? 'Lỗi sai' : 'Cần cải thiện'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm line-through text-gray-400 font-medium">{seg.text}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <span className="text-sm font-bold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                              {seg.suggestion}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed italic border-t border-gray-100 pt-2 mt-1">
                            {seg.explanation}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultMetric({ label, value, icon, highlight = false }) {
  return (
    <div className="card p-6 flex items-center gap-4 bg-white shadow-md hover:shadow-lg transition-all group">
      <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={cn("text-2xl font-black", highlight ? "text-primary-600" : "text-gray-900")}>
          {value}
        </p>
      </div>
    </div>
  )
}

function Trophy(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
