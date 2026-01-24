import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react'
import api from '../../api/axios'

export default function FlashcardContentEditor({ game, onChange }) {
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingCard, setEditingCard] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        front: '',
        back: '',
        example: '',
        displayOrder: 0
    })

    useEffect(() => {
        fetchCards()
    }, [game.gameId])

    const fetchCards = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/games/${game.gameId}/content`)
            setCards(response.data || [])
        } catch (error) {
            console.error('Error fetching flashcards:', error)
            setCards([])
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setEditingCard(null)
        setFormData({ front: '', back: '', example: '', displayOrder: cards.length + 1 })
        setShowForm(true)
    }

    const handleEdit = (card) => {
        setEditingCard(card)
        setFormData({
            front: card.front,
            back: card.back,
            example: card.example,
            displayOrder: card.displayOrder
        })
        setShowForm(true)
    }

    const handleDelete = async (cardId) => {
        if (!confirm('Are you sure you want to delete this card?')) return

        try {
            await api.delete(`/games/flashcards/${cardId}`)
            await fetchCards()
            onChange()
        } catch (error) {
            console.error('Error deleting card:', error)
            alert('Error deleting card. Please try again.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingCard) {
                await api.put(`/games/flashcards/${editingCard.cardId}`, formData)
            } else {
                await api.post(`/games/${game.gameId}/flashcards`, formData)
            }

            await fetchCards()
            setShowForm(false)
            setEditingCard(null)
            setFormData({ front: '', back: '', example: '', displayOrder: 0 })
            onChange()
        } catch (error) {
            console.error('Error saving card:', error)
            alert('Error saving card. Please try again.')
        }
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingCard(null)
        setFormData({ front: '', back: '', example: '', displayOrder: 0 })
    }

    if (loading) {
        return <div className="text-center py-12">Loading flashcards...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Flashcards</h3>
                    <p className="text-sm text-gray-600">Manage vocabulary flashcards with examples</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Card</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                        {editingCard ? 'Edit Card' : 'Add New Card'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Front (English) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.front}
                                    onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g., Apple"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Back (Vietnamese) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.back}
                                    onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g., Quả táo"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Example Sentence
                            </label>
                            <input
                                type="text"
                                value={formData.example}
                                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g., I eat an apple every day."
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingCard ? 'Update' : 'Add'}</span>
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
                {cards.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
                        No flashcards yet. Click "Add Card" to get started.
                    </div>
                ) : (
                    cards.map((card, index) => (
                        <div key={card.cardId} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                        <span className="text-lg font-semibold text-gray-900">{card.front}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-lg text-gray-700">{card.back}</span>
                                    </div>
                                    {card.example && (
                                        <p className="text-sm text-gray-600 italic ml-12">"{card.example}"</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(card)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.cardId)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <p className="text-sm text-pink-800">
                    <strong>Total Cards:</strong> {cards.length} •
                    <strong className="ml-2">Recommended:</strong> 10-15 cards for effective learning
                </p>
            </div>
        </div>
    )
}
