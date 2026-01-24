import { useState } from 'react'
import WordMatchContentEditor from './content-editors/WordMatchContentEditor'
import FlashcardContentEditor from './content-editors/FlashcardContentEditor'
import SpellingContentEditor from './content-editors/SpellingContentEditor'
import QuizContentEditor from './content-editors/QuizContentEditor'
import PuzzleContentEditor from './content-editors/PuzzleContentEditor'

export default function GameContentEditor({ game, onClose }) {
    const [hasChanges, setHasChanges] = useState(false)

    const handleContentChange = () => {
        setHasChanges(true)
    }

    const handleSave = () => {
        // TODO: Connect to backend API
        alert('Content saved! (Mock - will connect to API later)')
        setHasChanges(false)
        onClose()
    }

    const handleClose = () => {
        if (hasChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose()
            }
        } else {
            onClose()
        }
    }

    const renderEditor = () => {
        const gameType = game.gameType?.toUpperCase() || ''

        switch (gameType) {
            case 'WORD_MATCH':
            case 'WORD MATCH':
                return <WordMatchContentEditor game={game} onChange={handleContentChange} />

            case 'FLASHCARD':
            case 'FLASH CARD':
                return <FlashcardContentEditor game={game} onChange={handleContentChange} />

            case 'SPELLING':
                return <SpellingContentEditor game={game} onChange={handleContentChange} />

            case 'QUIZ':
                return <QuizContentEditor game={game} onChange={handleContentChange} />

            case 'PUZZLE':
                return <PuzzleContentEditor game={game} onChange={handleContentChange} />

            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-600">
                            Content editor for game type "{game.gameType}" is not available yet.
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Edit Game Content</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {game.title} • {game.gameType}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderEditor()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {hasChanges && (
                            <span className="text-orange-600 font-medium">● Unsaved changes</span>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
