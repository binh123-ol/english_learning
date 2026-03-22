import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Clock, TrendingUp, CheckCircle, ChevronRight, Sparkles, Filter, Search } from 'lucide-react'

export default function Lessons() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [learningPath, setLearningPath] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchLessons()
    fetchLearningPath()
  }, [user])

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/lessons')
      setLessons(response.data)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLearningPath = async () => {
    if (!user?.userId) return
    try {
      const response = await axios.get(`/lessons/users/${user.userId}/learning-path`)
      setLearningPath(response.data)
    } catch (error) {
      console.error('Error fetching learning path:', error)
    }
  }

  const categories = ['All', 'GRAMMAR', 'VOCABULARY', 'LISTENING', 'SPEAKING', 'READING']
  
  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = activeCategory === 'All' || lesson.lessonType === activeCategory
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Đang tải bài học bài bản cho bạn...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header with Search & Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary-600 font-bold tracking-wider text-sm uppercase">
            <Sparkles className="w-4 h-4" />
            Vươn tời đỉnh cao
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Thư viện bài học</h1>
          <p className="text-gray-500 text-lg max-w-xl">Học tiếng Anh bài bản qua các bài học tương tác được thiết kế riêng cho trình độ của bạn.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài học..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="p-2 bg-gray-100 rounded-xl mr-2">
          <Filter className="w-5 h-5 text-gray-500" />
        </div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat === 'All' ? 'Tất cả' : cat}
          </button>
        ))}
      </div>

      {/* Learning Path (Hero Section) */}
      {learningPath.length > 0 && activeCategory === 'All' && !searchQuery && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <div className="w-2 h-8 bg-primary-600 rounded-full" />
              Lộ trình của bạn
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {learningPath.slice(0, 3).map((path, idx) => (
                <div key={path.pathId} className="group relative">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                   <div className="relative flex flex-col h-full bg-white p-6 rounded-[1.4rem] border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                         <div className={`p-3 rounded-2xl ${path.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'}`}>
                            {path.status === 'COMPLETED' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                         </div>
                         <div className="text-right">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tiến trình</span>
                            <p className="text-lg font-black text-primary-600">{path.progressPercentage}%</p>
                         </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
                        {path.lesson?.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 flex-grow">{path.lesson?.lessonType} • Level {path.lesson?.level}</p>
                      
                      <div className="space-y-3">
                         <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary-600 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${path.progressPercentage}%` }}
                            />
                         </div>
                         <Link
                            to={`/dashboard/lessons/${path.lesson?.lessonId}`}
                            className="flex items-center justify-center w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary-600 transition-all active:scale-95"
                         >
                            {path.status === 'COMPLETED' ? 'Ôn tập lại' : 'Học tiếp ngay'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                         </Link>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </section>
      )}

      {/* All Lessons Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full" />
          {activeCategory === 'All' ? 'Tất cả bài học' : `Bài học ${activeCategory}`}
        </h2>
        
        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLessons.map((lesson) => (
              <Link
                key={lesson.lessonId}
                to={`/dashboard/lessons/${lesson.lessonId}`}
                className="group card overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-none ring-1 ring-gray-100"
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-sm font-bold flex items-center">
                        Xem chi tiết <ChevronRight className="w-4 h-4" />
                      </span>
                   </div>
                   <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 text-[10px] font-black bg-white/90 text-gray-900 rounded-full uppercase tracking-tighter">
                        {lesson.lessonType}
                      </span>
                   </div>
                   {/* Placeholder for real image if available */}
                   <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BookOpen className="w-12 h-12 opacity-20" />
                   </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">{lesson.level}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                       <Clock className="w-3 h-3" />
                       {lesson.estimatedDurationMinutes || 15} MIN
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors uppercase leading-tight">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-8">
                    {lesson.description}
                  </p>
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-black text-gray-700">{lesson.xpReward} XP</span>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <div className="p-4 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-gray-500 font-bold">Không tìm thấy bài học nào phù hợp.</p>
             <button 
               onClick={() => {setActiveCategory('All'); setSearchQuery('')}}
               className="mt-4 text-primary-600 font-bold hover:underline"
             >
               Đặt lại bộ lọc
             </button>
          </div>
        )}
      </section>
    </div>
  )
}
