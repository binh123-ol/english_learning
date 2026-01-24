import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, CheckCircle } from 'lucide-react'
import api from '../../api/axios'

export default function QuizContentEditor({ game, onChange }) {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 0,
        explanation: ''
    })

    useEffect(() => {
        fetchQuestions()
    }, [game.gameId])

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${game.gameId}/content`)
            setQuestions(response.data || [])
        } catch (error) {
            console.error('Error fetching quiz questions:', error)
            setQuestions([])
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingQuestion(null)
        setFormData({
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 0,
            explanation: ''
        })
        setShowForm(true)
    }

    const handleEdit = (question) => {
        setEditingQuestion(question)
        setFormData({
            question: question.question,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        })
        setShowForm(true)
    }

    const handleDelete = async (questionId) => {
        if (!confirm('Are you sure you want to delete this question?')) return

        try {
            await api.delete(`/games/quiz-questions/${questionId}`)
            await fetchQuestions()
            onChange()
        } catch (error) {
            console.error('Error deleting question:', error)
            alert('Error deleting question. Please try again.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
            alert('Please fill in all 4 options')
            return
        }

        try {
            if (editingQuestion) {
                await api.put(`/games/quiz-questions/${editingQuestion.questionId}`, formData)
            } else {
                await api.post(`/games/${game.gameId}/quiz-questions`, formData)
            }

            await fetchQuestions()
            setShowForm(false)
            setEditingQuestion(null)
            setFormData({
                question: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                correctAnswer: 0,
                explanation: ''
            })
            onChange()
        } catch (error) {
            console.error('Error saving question:', error)
            alert('Error saving question. Please try again.')
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingQuestion(null)
        setFormData({
            question: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 0,
            explanation: ''
        })
    }

    if (loading) {
        return <div className="text-center py-12">Loading quiz questions...</div>
    }

    const options = ['optionA', 'optionB', 'optionC', 'optionD']

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quiz Questions</h3>
                    <p className="text-sm text-gray-600">Manage multiple choice questions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Question</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question *
                            </label>
                            <textarea
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                rows="2"
                                placeholder="Enter your question here..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Answer Options * (Select the correct answer)
                            </label>
                            <div className="space-y-2">
                                {options.map((optKey, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={formData.correctAnswer === index}
                                            onChange={() => setFormData({ ...formData, correctAnswer: index })}
                                            className="w-4 h-4 text-primary-600"
                                        />
                                        <span className="text-sm font-medium text-gray-700 w-8">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <input
                                            type="text"
                                            value={formData[optKey]}
                                            onChange={(e) => setFormData({ ...formData, [optKey]: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            required
                                        />
                                        {formData.correctAnswer === index && (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Explanation
                            </label>
                            <textarea
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                rows="2"
                                placeholder="Explain why this is the correct answer..."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingQuestion ? 'Update' : 'Add'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center space-x-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
                        No questions yet. Click "Add Question" to get started.
                    </div>
                ) : (
                    questions.map((question, index) => {
                        const opts = [question.optionA, question.optionB, question.optionC, question.optionD]
                        return (
                            <div key={question.questionId} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                                Q{index + 1}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-3">{question.question}</h4>
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {opts.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`p-2 rounded-lg border-2 ${optIndex === question.correctAnswer
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200'
                                                        }`}
                                                >
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {String.fromCharCode(65 + optIndex)}. {option}
                                                    </span>
                                                    {optIndex === question.correctAnswer && (
                                                        <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {question.explanation && (
                                            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                                <strong>Explanation:</strong> {question.explanation}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(question)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question.questionId)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                    <strong>Total Questions:</strong> {questions.length} •
                    <strong className="ml-2">Recommended:</strong> 5-10 questions for a quiz
                </p>
            </div>
        </div>
    )
}
