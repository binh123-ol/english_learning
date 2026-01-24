import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import api from '../../api/axios'

export default function SpellingContentEditor({ game, onChange }) {
    const [words, setWords] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingWord, setEditingWord] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        word: '',
        hint: '',
        difficulty: 'MEDIUM'
    })

    useEffect(() => {
        fetchWords()
    }, [game.gameId])

    const fetchWords = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${game.gameId}/content`)
            setWords(response.data || [])
        } catch (error) {
            console.error('Error fetching spelling words:', error)
            setWords([])
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingWord(null)
        setFormData({ word: '', hint: '', difficulty: 'MEDIUM' })
        setShowForm(true)
    }

    const handleEdit = (word) => {
        setEditingWord(word)
        setFormData({
            word: word.word,
            hint: word.hint,
            difficulty: word.difficulty
        })
        setShowForm(true)
    }

    const handleDelete = async (wordId) => {
        if (!confirm('Are you sure you want to delete this word?')) return

        try {
            await api.delete(`/games/spelling-words/${wordId}`)
            await fetchWords()
            onChange()
        } catch (error) {
            console.error('Error deleting word:', error)
            alert('Error deleting word. Please try again.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingWord) {
                await api.put(`/games/spelling-words/${editingWord.wordId}`, formData)
            } else {
                await api.post(`/games/${game.gameId}/spelling-words`, formData)
            }

            await fetchWords()
            setShowForm(false)
            setEditingWord(null)
            setFormData({ word: '', hint: '', difficulty: 'MEDIUM' })
            onChange()
        } catch (error) {
            console.error('Error saving word:', error)
            alert('Error saving word. Please try again.')
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingWord(null)
        setFormData({ word: '', hint: '', difficulty: 'MEDIUM' })
    }

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-800'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
            case 'HARD': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading spelling words...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Spelling Words</h3>
                    <p className="text-sm text-gray-600">Manage words for spelling practice</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Word</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                        {editingWord ? 'Edit Word' : 'Add New Word'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Word (English) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.word}
                                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g., beautiful"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Length: {formData.word.length} letters</p>
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
                                    placeholder="e.g., đẹp"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="EASY">Easy (4-6 letters)</option>
                                    <option value="MEDIUM">Medium (7-9 letters)</option>
                                    <option value="HARD">Hard (10+ letters)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingWord ? 'Update' : 'Add'}</span>
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

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Word</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hint</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {words.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No words yet. Click "Add Word" to get started.
                                </td>
                            </tr>
                        ) : (
                            words.map((word, index) => (
                                <tr key={word.wordId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{word.word}</span>
                                        <span className="text-xs text-gray-500 ml-2">({word.word.length} letters)</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{word.hint}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(word.difficulty)}`}>
                                            {word.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(word)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(word.wordId)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <p className="text-sm text-cyan-800">
                    <strong>Total Words:</strong> {words.length} •
                    <strong className="ml-2">Recommended:</strong> 8-12 words for a good practice session
                </p>
            </div>
        </div>
    )
}
