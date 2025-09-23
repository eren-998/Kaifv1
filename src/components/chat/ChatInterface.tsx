import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Settings, Sun, Moon } from 'lucide-react'
import { useChat } from '../../hooks/useChat'
import { ChatInput } from './ChatInput'
import { Button } from '../ui/Button'
import { SettingsPanel } from './SettingsPanel'
import { MicrophonePermissionModal } from './MicrophonePermissionModal'
import { ChatSidebar } from './ChatSidebar'
import { WelcomeScreen } from './WelcomeScreen'
import { ChatView } from './ChatView'
import { ChatHeader } from './ChatHeader'

export const ChatInterface: React.FC = () => {
  const {
    user,
    conversations,
    messages,
    selectedConversationId,
    loading,
    loadingHistory,
    selectConversation,
    newChat,
    sendMessage,
    sendAudioMessage,
    deleteConversation,
    deleteAllChats,
  } = useChat()
  
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showMobileMenu])

  const handleSelectConversation = (id: string) => {
    selectConversation(id)
    setShowMobileMenu(false)
  }

  const handleNewChat = () => {
    newChat()
    setShowMobileMenu(false)
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
      <ChatHeader 
        onToggleMobileMenu={() => setShowMobileMenu(true)}
        onShowSettings={() => setShowSettings(true)}
        darkMode={darkMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex lg:flex-col lg:w-64 border-r border-gray-200 dark:border-gray-700">
          <ChatSidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            loading={loadingHistory}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={deleteConversation}
            darkMode={darkMode}
          />
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>{user?.email}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Free Plan</p>
              </div>
            </div>
            <Button onClick={() => setShowSettings(true)} variant="outline" size="sm" className="w-full">
              <Settings className="w-4 h-4" />Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {selectedConversationId ? (
              <ChatView messages={messages} loading={loading} darkMode={darkMode} />
            ) : (
              <WelcomeScreen onSendMessage={sendMessage} darkMode={darkMode} />
            )}
          </div>
          <ChatInput 
            onSendMessage={sendMessage} 
            onSendAudio={sendAudioMessage} 
            onPermissionDenied={() => setShowPermissionModal(true)}
            loading={loading} 
            darkMode={darkMode}
          />
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileMenu(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className={`fixed left-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-50 lg:hidden shadow-xl flex flex-col`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conversations</h2>
                <Button onClick={() => setShowMobileMenu(false)} variant="outline" size="sm"><X className="w-4 h-4" /></Button>
              </div>
              <div className="flex-1">
                <ChatSidebar
                  conversations={conversations}
                  selectedConversationId={selectedConversationId}
                  loading={loadingHistory}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  onDeleteConversation={deleteConversation}
                  darkMode={darkMode}
                />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={() => { setDarkMode(!darkMode); setShowMobileMenu(false); }} variant="outline" size="sm" className="w-full justify-start">
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onDeleteAllChats={deleteAllChats} />
      <MicrophonePermissionModal isOpen={showPermissionModal} onClose={() => setShowPermissionModal(false)} darkMode={darkMode} />
    </div>
  )
}
