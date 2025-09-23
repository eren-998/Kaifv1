import React from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import type { Message } from '../../types'

interface ChatViewProps {
  messages: Message[]
  loading: boolean
  darkMode: boolean
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, loading, darkMode }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 w-full">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} darkMode={darkMode} />
      ))}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-3 p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg mb-4`}
        >
          <div className={`w-8 h-8 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>KaifV1</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>thinking...</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
              <div className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
              <div className={`w-2 h-2 ${darkMode ? 'bg-blue-400' : 'bg-blue-500'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
