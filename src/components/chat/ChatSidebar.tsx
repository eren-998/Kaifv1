import React from 'react'
import { Plus, MessageSquare, Trash2, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Conversation } from '../../types'

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  loading: boolean
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  darkMode: boolean
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  loading,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  darkMode,
}) => {
  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {conversations.map((convo) => (
              <motion.div
                key={convo.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedConversationId === convo.id
                    ? darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    : darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                }`}
                onClick={() => onSelectConversation(convo.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{convo.title || 'New Conversation'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(convo.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
