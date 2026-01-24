import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ArrowLeft, CheckCircle, XCircle, Clock, Award } from 'lucide-react'

export default function ExamHistory() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const [session, setSession] = useState(null)
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSessionHistory()
    }, [sessionId])

    const fetchSessionHistory = async () => {
        try {
            setLoading(true)

            // Fetch session details
            const sessionRes = await api.get(`/sessions/${sessionId}`)
            setSession(sessionRes.data)

            // Fetch all answers
            const answersRes = await api.get(`/sessions/${sessionId}/answers`)
            setAnswers(answersRes.data || [])
        } catch (error) {
            console.error('Error fetching exam history:', error)
            alert('Error loading exam history. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getPassStatus = () => {
        if (!session?.exam?.totalScore || !session?.finalScore) return 'unknown'
        const percentage = (session.finalScore / session.exam.totalScore) * 100
        return percentage >= 50 ? 'pass' : 'fail'
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải lịch sử...</p>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Không tìm thấy lịch sử bài thi</p>
                <button
                    onClick={() => navigate('/dashboard/results')}
                    className="btn btn-primary"
                >
                    Quay lại
                </button>
            </div>
        )
    }

    const passStatus = getPassStatus()
    const percentage = session.exam?.totalScore
        ? Math.round((session.finalScore / session.exam.totalScore) * 100)
        : 0

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/dashboard/results')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Quay lại kết quả</span>
                </button>
            </div>

            {/* Session Summary */}
            <div className="card">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{session.exam?.title}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Thời gian</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatDate(session.finishedAt || session.startedAt)}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <Award className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Điểm số</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                            {session.finalScore || 0}/{session.exam?.totalScore || 100} ({percentage}%)
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            {passStatus === 'pass' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="text-sm text-gray-600">Kết quả</span>
                        </div>
                        <p className={`text-lg font-bold ${passStatus === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                            {passStatus === 'pass' ? 'Đạt' : 'Không đạt'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Tổng số câu đúng</span>
                    <span className="text-lg font-bold text-blue-600">
                        {session.totalCorrect || 0}/{answers.length}
                    </span>
                </div>
            </div>

            {/* Answers Review */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết câu trả lời</h2>

                {answers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Không có câu trả lời nào</p>
                ) : (
                    <div className="space-y-4">
                        {answers.map((answer, index) => (
                            <div
                                key={answer.answerId}
                                className={`p-4 rounded-lg border-2 ${answer.isCorrect
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-red-200 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="flex-shrink-0 w-7 h-7 bg-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </span>
                                        <p className="font-medium text-gray-900">
                                            {answer.question?.textContent || answer.question?.questionText}
                                        </p>
                                    </div>
                                    {answer.isCorrect ? (
                                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    )}
                                </div>

                                <div className="ml-9 space-y-2">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Câu trả lời của bạn: </span>
                                        <span className={`text-sm ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                            {answer.selectedOption?.optionText || answer.textResponse || 'Không trả lời'}
                                        </span>
                                    </div>

                                    {!answer.isCorrect && answer.question?.correctAnswerText && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">Đáp án đúng: </span>
                                            <span className="text-sm text-green-700">
                                                {answer.question.correctAnswerText}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Loại câu hỏi: {answer.question?.questionType}</span>
                                        <span>Điểm: {answer.scoreEarned || 0}/{answer.question?.scorePoints || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => navigate('/dashboard/results')}
                    className="btn btn-secondary"
                >
                    Quay lại kết quả
                </button>
                <button
                    onClick={() => navigate('/dashboard/exams')}
                    className="btn btn-primary"
                >
                    Làm bài thi khác
                </button>
            </div>
        </div>
    )
}
