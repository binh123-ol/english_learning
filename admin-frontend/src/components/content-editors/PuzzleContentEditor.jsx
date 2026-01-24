import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import api from '../../api/axios'

export default function PuzzleContentEditor({ game, onChange }) {
    const [puzzles, setPuzzles] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingPuzzle, setEditingPuzzle] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        sentence: '',
        hint: '',
        puzzleType: 'sentence'
    })

    useEffect(() => {
        fetchPuzzles()
    }, [game.gameId])

    const fetchPuzzles = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${game.gameId}/content`)
            setPuzzles(response.data || [])
        } catch (error) {
            console.error('Error fetching puzzles:', error)
            setPuzzles([])
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingPuzzle(null)
        setFormData({ sentence: '', hint: '', puzzleType: 'sentence' })
        setShowForm(true)
    }

    const handleEdit = (puzzle) => {
        setEditingPuzzle(puzzle)
        setFormData({
            sentence: puzzle.sentence,
            hint: puzzle.hint,
            puzzleType: puzzle.puzzleType
        })
        setShowForm(true)
    }

    const handleDelete = async (puzzleId) => {
        if (!confirm('Are you sure you want to delete this puzzle?')) return

        try {
            await api.delete(`/games/puzzles/${puzzleId}`)
            await fetchPuzzles()
            onChange()
        } catch (error) {
            console.error('Error deleting puzzle:', error)
            alert('Error deleting puzzle. Please try again.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingPuzzle) {
                await api.put(`/games/puzzles/${editingPuzzle.puzzleId}`, formData)
            } else {
                await api.post(`/games/${game.gameId}/puzzles`, formData)
            }

            await fetchPuzzles()
            setShowForm(false)
            setEditingPuzzle(null)
            setFormData({ sentence: '', hint: '', puzzleType: 'sentence' })
            onChange()
        } catch (error) {
            console.error('Error saving puzzle:', error)
            alert('Error saving puzzle. Please try again.')
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingPuzzle(null)
        setFormData({ sentence: '', hint: '', puzzleType: 'sentence' })
    }

    const getWordCount = (sentence) => {
        return sentence.trim().split(/\s+/).length
    }

    const getDifficultyLevel = (wordCount) => {
        if (wordCount <= 4) return { label: 'Easy', color: 'bg-green-100 text-green-800' }
        if (wordCount <= 7) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
        return { label: 'Hard', color: 'bg-red-100 text-red-800' }
    }

    if (loading) {
        return <div className="text-center py-12">Loading puzzles...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Puzzle Sentences</h3>
                    <p className="text-sm text-gray-600">Manage sentences for word arrangement puzzles</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Puzzle</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                        {editingPuzzle ? 'Edit Puzzle' : 'Add New Puzzle'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sentence (English) *
                            </label>
                            <input
                                type="text"
                                value={formData.sentence}
                                onChange={(e) => setFormData({ ...formData, sentence: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g., I love learning English every day"
                                required
                            />
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                    Words: {getWordCount(formData.sentence)}
                                </p>
                                {formData.sentence && (
                                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyLevel(getWordCount(formData.sentence)).color}`}>
                                        {getDifficultyLevel(getWordCount(formData.sentence)).label}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hint (Vietnamese) *
                            </label>
                            <input
                                type="text"
                                value={formData.hint}
                                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g., Tôi yêu thích học tiếng Anh mỗi ngày"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={formData.puzzleType}
                                onChange={(e) => setFormData({ ...formData, puzzleType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="sentence">Sentence</option>
                                <option value="phrase">Phrase</option>
                            </select>
                        </div>

                        {formData.sentence && (
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <p className="text-xs text-gray-600 mb-2">Preview (shuffled words):</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.sentence.trim().split(/\s+/).sort(() => Math.random() - 0.5).map((word, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingPuzzle ? 'Update' : 'Add'}</span>
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

            <div className="space-y-3">
                {puzzles.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
                        No puzzles yet. Click "Add Puzzle" to get started.
                    </div>
                ) : (
                    puzzles.map((puzzle, index) => {
                        const wordCount = getWordCount(puzzle.sentence)
                        const difficulty = getDifficultyLevel(wordCount)

                        return (
                            <div key={puzzle.puzzleId} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${difficulty.color}`}>
                                                {difficulty.label}
                                            </span>
                                            <span className="text-xs text-gray-500">({wordCount} words)</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">{puzzle.sentence}</p>
                                        <p className="text-sm text-gray-600 italic">💡 {puzzle.hint}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {puzzle.sentence.split(/\s+/).map((word, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(puzzle)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(puzzle.puzzleId)}
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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    <strong>Total Puzzles:</strong> {puzzles.length} •
                    <strong className="ml-2">Recommended:</strong> 5-8 puzzles •
                    <strong className="ml-2">Tip:</strong> Keep sentences between 4-8 words for best experience
                </p>
            </div>
        </div>
    )
}
