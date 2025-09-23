import React from 'react'
import { BrainCircuit, Zap } from 'lucide-react'
import { Button } from '../ui/Button'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
  darkMode: boolean
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage, darkMode }) => {
  const suggestions = [
    "Explain quantum computing",
    "Help me write a story",
    "Solve a complex problem",
    "What is the capital of Nepal?"
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className={`w-16 h-16 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <BrainCircuit className="w-8 h-8 text-white" />
      </div>
      <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
        How can I help you today?
      </h2>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
        Start a new conversation with KaifV1
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mx-auto">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className={`text-left justify-start h-auto p-3 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}`}
            onClick={() => onSendMessage(suggestion)}
          >
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}
