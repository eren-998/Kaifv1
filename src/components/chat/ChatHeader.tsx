import React from 'react'
import { Menu, BrainCircuit, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface ChatHeaderProps {
  onToggleMobileMenu: () => void
  onShowSettings: () => void
  darkMode: boolean
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onToggleMobileMenu, onShowSettings, darkMode }) => {
  return (
    <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between lg:hidden`}>
      <Button onClick={onToggleMobileMenu} variant="outline" size="sm" className={`${darkMode ? 'border-gray-600 text-gray-300' : ''}`}>
        <Menu className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 ${darkMode ? 'bg-blue-500' : 'bg-blue-600'} rounded-full flex items-center justify-center`}>
          <BrainCircuit className="w-3 h-3 text-white" />
        </div>
        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>KaifV1</span>
      </div>
      <Button onClick={onShowSettings} variant="outline" size="sm" className={`${darkMode ? 'border-gray-600 text-gray-300' : ''}`}>
        <Settings className="w-4 h-4" />
      </Button>
    </header>
  )
}
