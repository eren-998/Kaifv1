import React from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Copy, Check, BrainCircuit, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '../../types'
import { AudioPlayer } from './AudioPlayer'

interface ChatMessageProps {
  message: Message
  darkMode?: boolean
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, darkMode = false }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const copyToClipboard = async () => {
    try {
      if (message.type === 'audio' && message.audio_url) {
        await navigator.clipboard.writeText('Audio message');
      } else {
        await navigator.clipboard.writeText(message.content);
      }
      setCopyStatus('success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('error');
    }
    setTimeout(() => setCopyStatus('idle'), 2500);
  };

  const isJsonResponse = message.content.startsWith('{') && message.content.endsWith('}')
  
  let formattedContent = message.content
  if (isJsonResponse && !message.isUser) {
    try {
      const parsed = JSON.parse(message.content)
      formattedContent = JSON.stringify(parsed, null, 2)
    } catch {
      // If parsing fails, keep original content
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative mb-6 ${message.isUser ? 'ml-auto max-w-[85%] md:max-w-[70%]' : 'mr-auto'}`}
    >
      <div className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.isUser 
            ? 'bg-blue-600' 
            : darkMode 
              ? 'bg-gray-600' 
              : 'bg-gray-700'
        }`}>
          {message.isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <BrainCircuit className="w-4 h-4 text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`flex-1 min-w-0 ${message.isUser ? 'text-right' : 'text-left'}`}>
          {/* Message Bubble */}
          <div className={`inline-block max-w-full px-4 py-3 rounded-2xl ${
            message.isUser
              ? 'bg-blue-600 text-white'
              : darkMode
                ? 'bg-gray-700 text-gray-100'
                : 'bg-gray-100 text-gray-900'
          } ${message.isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
            {message.type === 'audio' && message.audio_url ? (
              <AudioPlayer audioUrl={message.audio_url} isUser={message.isUser} darkMode={darkMode} />
            ) : (
              <div className={`${
                isJsonResponse && !message.isUser 
                  ? `${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-3 rounded-lg border font-mono text-sm overflow-x-auto` 
                  : ''
              } whitespace-pre-wrap break-words`}>
                {formattedContent}
              </div>
            )}
          </div>
          
          {/* Message Meta */}
          <div className={`flex items-center gap-2 mt-1 text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          } ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <span>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            {/* Copy Button */}
            {!message.isUser && (
              <button
                onClick={copyToClipboard}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  copyStatus === 'success' ? 'text-green-500' : 
                  copyStatus === 'error' ? 'text-red-500' :
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
                title={
                  copyStatus === 'success' ? 'Copied!' :
                  copyStatus === 'error' ? 'Copy failed due to browser permissions' :
                  'Copy message'
                }
              >
                {copyStatus === 'success' && <Check className="w-3 h-3" />}
                {copyStatus === 'error' && <AlertTriangle className="w-3 h-3" />}
                {copyStatus === 'idle' && <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
