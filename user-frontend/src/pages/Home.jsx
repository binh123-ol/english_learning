import { Link } from 'react-router-dom'
import { BookOpen, Target, TrendingUp, CheckCircle, ArrowRight, Sparkles, MessageCircle, Gamepad2, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                English Learning
              </span>
            </div>
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Nền tảng học tiếng Anh thông minh với AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Học Tiếng Anh
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thông Minh Hơn
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Nền tảng học tiếng Anh toàn diện với AI, đánh giá trình độ cá nhân hóa và lộ trình học phù hợp với mục tiêu của bạn
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Phát triển toàn diện 6 kỹ năng: Listening, Reading, Writing, Speaking, Grammar, Vocabulary
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span>Tham gia cùng chúng tôi</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 bg-white text-gray-700 px-10 py-5 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300 shadow-md"
            >
              <span>Đã có tài khoản?</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nền tảng học tiếng Anh hiện đại với công nghệ AI và phương pháp học tập cá nhân hóa
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Đánh Giá Trình Độ</h3>
            <p className="text-gray-600 leading-relaxed">
              Bài kiểm tra đánh giá toàn diện 6 kỹ năng để xác định trình độ tiếng Anh của bạn và xây dựng lộ trình học phù hợp
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Lộ Trình Cá Nhân Hóa</h3>
            <p className="text-gray-600 leading-relaxed">
              Học tập theo lộ trình được thiết kế riêng dựa trên kết quả đánh giá và mục tiêu của bạn. AI tự động đề xuất bài học phù hợp
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Bài Học Tương Tác</h3>
            <p className="text-gray-600 leading-relaxed">
              Hơn 20+ bài học đa dạng về Grammar, Vocabulary, Listening, Reading, Writing, Speaking với tài liệu phong phú
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Gamepad2 className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Trò Chơi Ngôn Ngữ</h3>
            <p className="text-gray-600 leading-relaxed">
              Vừa học vừa chơi với các trò chơi thú vị: Word Match, Flashcard, Spelling, Quiz, Puzzle. Tích lũy XP và thi đua với bạn bè
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Luyện Nói với AI</h3>
            <p className="text-gray-600 leading-relaxed">
              Trò chuyện với AI chatbot để luyện nói mọi lúc mọi nơi. Nhận feedback về phát âm, ngữ pháp và chính tả ngay lập tức
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Theo Dõi Tiến Độ</h3>
            <p className="text-gray-600 leading-relaxed">
              Thống kê chi tiết về quá trình học tập, learning streak, tổng XP và báo cáo tiến độ theo ngày/tuần/tháng
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Cách Thức Hoạt Động</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bắt đầu hành trình học tiếng Anh của bạn chỉ trong 3 bước đơn giản
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200"></div>
          
          <div className="text-center relative z-10">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              1
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Đăng Ký Miễn Phí</h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-xs mx-auto">
              Tạo tài khoản miễn phí chỉ trong vài giây. Không cần thẻ tín dụng, không có phí ẩn
            </p>
          </div>

          <div className="text-center relative z-10">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              2
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Đánh Giá Trình Độ</h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-xs mx-auto">
              Hoàn thành bài đánh giá toàn diện 6 kỹ năng để xác định trình độ tiếng Anh hiện tại của bạn
            </p>
          </div>

          <div className="text-center relative z-10">
            <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              3
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bắt Đầu Học Tập</h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-xs mx-auto">
              Nhận lộ trình học cá nhân hóa và bắt đầu hành trình nâng cao trình độ tiếng Anh của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              20+
            </div>
            <div className="text-gray-600 font-medium">Bài Học</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              5
            </div>
            <div className="text-gray-600 font-medium">Trò Chơi</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              6
            </div>
            <div className="text-gray-600 font-medium">Kỹ Năng</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              AI
            </div>
            <div className="text-gray-600 font-medium">Công Nghệ</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Sẵn Sàng Bắt Đầu?</h2>
            <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
              Tham gia cùng hàng ngàn học viên đang nâng cao trình độ tiếng Anh mỗi ngày. Miễn phí 100%!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                <span>Tham gia cùng chúng tôi</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-white/30 transition-all border-2 border-white/30"
              >
                <span>Đã có tài khoản? Đăng nhập</span>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-90">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Miễn phí mãi mãi</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Không cần thẻ tín dụng</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Hủy bất cứ lúc nào</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">English Learning</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nền tảng học tiếng Anh thông minh với AI và phương pháp học tập cá nhân hóa
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sản Phẩm</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Bài Học</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Trò Chơi</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Đánh Giá</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Thi Cử</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Trung Tâm Trợ Giúp</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Liên Hệ</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Công Ty</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Về Chúng Tôi</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Tuyển Dụng</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">© 2024 English Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

