import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import api from '../../api/axios'

export default function WordMatchContentEditor({ game, onChange }) {
    const [pairs, setPairs] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingPair, setEditingPair] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        englishWord: '',
        vietnameseTranslation: '',
        displayOrder: 0
    })

    useEffect(() => {
        fetchPairs()
    }, [game.gameId])

    const fetchPairs = async () => {
        try {
            setLoading(true)
            console.log('Fetching word pairs for game:', game.gameId)
            const response = await api.get(`/games/${game.gameId}/content`)
            console.log('Response received:', response.data)

            // Make sure response.data is an array
            const pairs = Array.isArray(response.data) ? response.data : []
            setPairs(pairs)
            console.log('Word pairs set:', pairs.length, 'items')
        } catch (error) {
            console.error('Error fetching word pairs:', error)
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            })
            setPairs([])
            // Show user-friendly error
            if (error.response?.status === 500) {
                alert('Server error. Please check if backend is running and restart it.')
            } else if (error.response?.status === 404) {
                alert('Game content not found. Please make sure the game exists.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingPair(null)
        setFormData({
            englishWord: '',
            vietnameseTranslation: '',
            displayOrder: pairs.length + 1
        })
        setShowForm(true)
    }

    const handleEdit = (pair) => {
        setEditingPair(pair)
        setFormData({
            englishWord: pair.englishWord,
            vietnameseTranslation: pair.vietnameseTranslation,
            displayOrder: pair.displayOrder
        })
        setShowForm(true)
    }

    const handleDelete = async (pairId) => {
        if (!confirm('Are you sure you want to delete this pair?')) return

        try {
            await api.delete(`/games/word-pairs/${pairId}`)
            await fetchPairs()
            onChange()
        } catch (error) {
            console.error('Error deleting pair:', error)
            alert('Error deleting pair. Please try again.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingPair) {
                await api.put(`/games/word-pairs/${editingPair.pairId}`, formData)
            } else {
                await api.post(`/games/${game.gameId}/word-pairs`, formData)
            }

            await fetchPairs()
            setShowForm(false)
            setEditingPair(null)
            setFormData({ englishWord: '', vietnameseTranslation: '', displayOrder: 0 })
            onChange()
        } catch (error) {
            console.error('Error saving pair:', error)
            alert('Error saving pair. Please try again.')
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingPair(null)
        setFormData({ englishWord: '', vietnameseTranslation: '', displayOrder: 0 })
    }

    if (loading) {
        return <div className="text-center py-12">Loading word pairs...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Word Match Pairs</h3>
                    <p className="text-sm text-gray-600">Manage English-Vietnamese word pairs for this game</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Pair</span>
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                        {editingPair ? 'Edit Pair' : 'Add New Pair'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    English Word *
                                </label>
                                <input
                                    type="text"
                                    value={formData.englishWord}
                                    onChange={(e) => setFormData({ ...formData, englishWord: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Hello"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vietnamese Translation *
                                </label>
                                <input
                                    type="text"
                                    value={formData.vietnameseTranslation}
                                    onChange={(e) => setFormData({ ...formData, vietnameseTranslation: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Xin chào"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingPair ? 'Update' : 'Add'}</span>
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

            {/* List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">English</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vietnamese</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pairs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                    No word pairs yet. Click "Add Pair" to get started.
                                </td>
                            </tr>
                        ) : (
                            pairs.map((pair, index) => (
                                <tr key={pair.pairId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{pair.englishWord}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">{pair.vietnameseTranslation}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(pair)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pair.pairId)}
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

            {/* Stats */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                    <strong>Total Pairs:</strong> {pairs.length} •
                    <strong className="ml-2">Recommended:</strong> 8-12 pairs for optimal gameplay
                </p>
            </div>
        </div>
    )
}
