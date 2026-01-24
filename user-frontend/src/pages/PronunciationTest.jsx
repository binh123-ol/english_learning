import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Mic, Upload, Play, CheckCircle, XCircle, Loader } from 'lucide-react'

export default function PronunciationTest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isRecording, setIsRecording] = useState(false) // For file recording
  const [isListening, setIsListening] = useState(false) // For browser recognition
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testMode, setTestMode] = useState('browser') // 'browser' | 'file'
  const [recognitionResult, setRecognitionResult] = useState(null) // { transcript, confidence, isFinal }

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioPlayerRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize Speech Recognition
  const startBrowserRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Vui lòng thử Chrome hoặc Edge.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setRecognitionResult(null)
      setError(null)
    }

    recognition.onresult = (event) => {
      const last = event.results.length - 1
      const transcript = event.results[last][0].transcript
      const confidence = event.results[last][0].confidence

      setRecognitionResult({
        transcript: transcript,
        confidence: confidence,
        isFinal: true
      })

      // Calculate score immediately
      calculateBrowserScore(text, transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      setError('Lỗi nhận dạng giọng nói: ' + event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopBrowserRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Handle Text-to-Speech
  const handleSpeak = () => {
    if (!text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9 // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance)
  }

  const calculateBrowserScore = (expected, actual) => {
    const analysis = compareTexts(expected, actual)
    setScore(analysis.score) // 0-1
  }

  // Helper to compare texts word by word
  const compareTexts = (expected, actual) => {
    if (!expected || !actual) return { score: 0, words: [] }

    const cleanBox = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(x => x)
    const expectedWords = cleanBox(expected)
    const actualWords = cleanBox(actual)

    // Simple word matching logic
    // This can be improved with Levenshtein distance for better alignment
    // For now, we'll check if expected words exist in actual string (loosely)

    let matchCount = 0
    let lastFoundIndex = -1

    const wordResults = expectedWords.map(word => {
      // Look for the word in actualWords after the last found index
      const foundIndex = actualWords.findIndex((w, i) => i > lastFoundIndex && w === word)

      if (foundIndex !== -1) {
        lastFoundIndex = foundIndex
        matchCount++
        return { word, status: 'correct' }
      } else {
        return { word, status: 'incorrect' }
      }
    })

    const score = expectedWords.length > 0 ? matchCount / expectedWords.length : 0

    return {
      score: score,
      details: wordResults
    }
  }

  // Standard File Recording (unchanged mostly)
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    } else {
      alert('Vui lòng chọn file audio')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setAudioFile(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleTest = async () => {
    if (!text.trim()) {
      alert('Vui lòng nhập text để test')
      return
    }

    if (testMode === 'browser') {
      startBrowserRecognition()
      return
    }

    setLoading(true)
    setError(null)
    setScore(null)

    try {
      let audioFileUrl = null

      if (audioFile) {
        const formData = new FormData()
        formData.append('file', audioFile, 'pronunciation.webm')

        try {
          const uploadResponse = await axios.post('/files/upload/audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          audioFileUrl = uploadResponse.data.url || uploadResponse.data.fileUrl
        } catch (uploadError) {
          console.error('Error uploading audio:', uploadError)
        }
      }

      const response = await axios.post('/ai/pronunciation/score', {
        text: text,
        audioFileUrl: audioFileUrl
      })

      setScore(response.data.score)
    } catch (err) {
      console.error('Error testing pronunciation:', err)
      setError('Có lỗi xảy ra khi test phát âm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'text-gray-500'
    const scoreValue = parseFloat(score)
    if (scoreValue >= 0.8) return 'text-green-600'
    if (scoreValue >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score) => {
    if (!score && score !== 0) return ''
    const scoreValue = parseFloat(score)
    if (scoreValue >= 0.9) return 'Xuất sắc'
    if (scoreValue >= 0.8) return 'Tốt'
    if (scoreValue >= 0.7) return 'Khá'
    if (scoreValue >= 0.6) return 'Trung bình'
    return 'Cần cải thiện'
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Phát Âm</h1>
        <p className="text-gray-600 mt-2">Kiểm tra và cải thiện phát âm tiếng Anh của bạn</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Luyện Tập</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text cần phát âm
            </label>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Nhập câu hoặc đoạn văn bạn muốn phát âm..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows="4"
              />
              <button
                onClick={handleSpeak}
                disabled={!text.trim()}
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-primary-600 disabled:opacity-30 transition-colors"
                title="Nghe mẫu"
              >
                <div className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {text.length} ký tự
            </p>
          </div>

          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setTestMode('browser')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${testMode === 'browser'
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              Test Trực Tiếp (Nhanh & Chính Xác)
            </button>
            <button
              onClick={() => setTestMode('file')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${testMode === 'file'
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              Upload File / Backend
            </button>
          </div>

          {testMode === 'browser' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {!isListening ? (
                  <button
                    onClick={handleTest}
                    disabled={!text.trim()}
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors cursor-pointer">
                      <Mic className="w-8 h-8 text-red-600" />
                    </div>
                    <span className="font-medium text-gray-700">Nhấn để nói</span>
                  </button>
                ) : (
                  <button
                    onClick={stopBrowserRecognition}
                    className="flex flex-col items-center space-y-2 animate-pulse"
                  >
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-6 h-6 bg-white rounded-sm"></div>
                    </div>
                    <span className="font-medium text-red-600">Đang nghe... (Nhấn để dừng)</span>
                  </button>
                )}
                {isListening && (
                  <p className="mt-4 text-sm text-gray-500">Hãy đọc to rõ ràng...</p>
                )}
              </div>
            </div>
          )}

          {testMode === 'file' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Record Audio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi âm (Record)
                </label>
                <div className="flex items-center space-x-2">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Mic className="w-5 h-5" />
                      <span>Bắt đầu ghi âm</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors animate-pulse"
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Dừng ghi âm</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Audio File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc Upload File Audio
                </label>
                <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Chọn file audio</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {testMode === 'file' && audioUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Audio đã ghi/upload:</span>
                <button
                  onClick={() => {
                    setAudioUrl(null)
                    setAudioFile(null)
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Xóa
                </button>
              </div>
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                controls
                className="w-full"
              />
            </div>
          )}

          {testMode === 'file' && (
            <button
              onClick={handleTest}
              disabled={loading || !text.trim() || (!audioFile && !audioUrl)}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Đang test...</span>
                </>
              ) : (
                <span>Chấm Điểm (Backend)</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {score !== null && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kết Quả</h2>

          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
                {(parseFloat(score) * 100).toFixed(0)}%
              </div>
              <div className={`text-xl font-semibold ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </div>
            </div>

            <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${parseFloat(score) >= 0.8 ? 'bg-green-500' :
                    parseFloat(score) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${parseFloat(score) * 100}%` }}
              />
            </div>

            {/* Word-by-word Feedback for Browser Mode */}
            {testMode === 'browser' && recognitionResult && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Chi tiết từng từ:</h3>
                  <div className="flex flex-wrap gap-2 text-lg leading-relaxed">
                    {compareTexts(text, recognitionResult.transcript).details.map((item, idx) => (
                      <span
                        key={idx}
                        className={`px-1 rounded ${item.status === 'correct'
                            ? 'text-green-700 bg-green-100'
                            : 'text-red-700 bg-red-100 line-through decoration-red-400'
                          }`}
                      >
                        {item.word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-xs font-semibold text-blue-700 mb-1 uppercase">AI Nghe được:</h3>
                  <p className="text-blue-900 italic">"{recognitionResult.transcript}"</p>
                </div>
              </div>
            )}

            {testMode === 'file' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Kết quả này được trả về từ server (Vosk Model).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center space-x-2 text-red-800">
            <XCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Hướng dẫn sử dụng:</h3>
        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
          <li><strong>Test Trực Tiếp:</strong> Sử dụng trình duyệt để nhận dạng giọng nói ngay lập tức. Độ chính xác cao và có chấm điểm từng từ.</li>
          <li><strong>Upload File / Backend:</strong> Ghi âm hoặc upload file để server xử lý (Hỗ trợ tốt hơn cho offline hoặc thiết bị cũ).</li>
          <li>Nhấn vào biểu tượng <strong>Loa</strong> để nghe phát âm mẫu.</li>
        </ul>
      </div>
    </div>
  )
}


