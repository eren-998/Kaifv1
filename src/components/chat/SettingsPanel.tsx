import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, LogOut, Moon, Sun, Bell, Shield, HelpCircle, Download, Trash2, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  onDeleteAllChats: () => void
}

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-3">
      {title}
    </h4>
    <div className="space-y-1">{children}</div>
  </div>
);

const SettingsItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  action?: React.ReactNode; 
  onClick?: () => void; 
  isDestructive?: boolean 
}> = ({ icon, label, action, onClick, isDestructive = false }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${onClick ? 'cursor-pointer' : ''} ${
      isDestructive
        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${isDestructive ? '' : 'text-gray-500 dark:text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${isDestructive ? '' : 'text-gray-800 dark:text-gray-200'}`}>
        {label}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {action}
    </div>
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
      checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <motion.div
      layout
      className="w-4 h-4 bg-white rounded-full shadow-md"
      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
    />
  </div>
);


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  onToggleDarkMode,
  onDeleteAllChats
}) => {
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      onClose()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const handleDeleteChats = () => {
    if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
      onDeleteAllChats()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed right-0 top-0 h-full w-full max-w-md ${
              darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-900'
            } shadow-2xl z-50 flex flex-col`}
          >
            <header className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between flex-shrink-0`}>
              <h2 className="text-xl font-semibold">Settings</h2>
              <Button onClick={onClose} variant="outline" size="sm" className={`${darkMode ? 'border-gray-600 text-gray-300' : ''}`}><X className="w-4 h-4" /></Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-8">
              {user && (
                <SettingsSection title="Account">
                  <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                        <User className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Free Plan</p>
                      </div>
                    </div>
                  </div>
                </SettingsSection>
              )}

              <SettingsSection title="Appearance">
                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <SettingsItem
                    icon={darkMode ? <Sun /> : <Moon />}
                    label={darkMode ? 'Light Mode' : 'Dark Mode'}
                    action={<ToggleSwitch checked={darkMode} onChange={onToggleDarkMode} />}
                  />
                </div>
              </SettingsSection>

              <SettingsSection title="Data">
                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <SettingsItem
                    icon={<Download />}
                    label="Export All Data"
                    action={<ChevronRight className="w-4 h-4 text-gray-400" />}
                    onClick={() => alert('Exporting data...')}
                  />
                  <SettingsItem
                    icon={<Trash2 />}
                    label="Delete All Chats"
                    isDestructive
                    onClick={handleDeleteChats}
                  />
                </div>
              </SettingsSection>
              
              <SettingsSection title="Support">
                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <SettingsItem
                    icon={<HelpCircle />}
                    label="Help Center"
                    action={<ChevronRight className="w-4 h-4 text-gray-400" />}
                    onClick={() => alert('Opening Help Center...')}
                  />
                  <SettingsItem
                    icon={<Shield />}
                    label="Privacy Policy"
                    action={<ChevronRight className="w-4 h-4 text-gray-400" />}
                    onClick={() => alert('Opening Privacy Policy...')}
                  />
                </div>
              </SettingsSection>
            </main>
            
            <footer className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <SettingsItem
                icon={<LogOut />}
                label="Log Out"
                isDestructive
                onClick={handleLogout}
              />
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
