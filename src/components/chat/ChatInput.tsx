import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic, X, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onSendAudio: (audioBlob: Blob, duration: number) => void
  onPermissionDenied: () => void
  loading?: boolean
  darkMode?: boolean
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendAudio, onPermissionDenied, loading, darkMode = false, disabled = false }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    permission,
    recordingStatus,
    startRecording,
    stopRecording,
    clearRecording,
    audioBlob,
    recordingTime,
  } = useVoiceRecorder()

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleAudioSubmit = () => {
    if (audioBlob && !disabled) {
      onSendAudio(audioBlob, recordingTime)
      clearRecording()
    }
  }

  const handleStartRecording = async () => {
    if (disabled) return
    try {
      await startRecording();
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        onPermissionDenied();
      } else {
        console.error("An unexpected error occurred during recording:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const renderInputState = () => {
    if (recordingStatus === 'recording') {
      return (
        <div className="flex items-center w-full gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <p className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recording...
          </p>
          <p className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(recordingTime)}
          </p>
          <Button type="button" onClick={stopRecording} className="p-2 bg-red-500 hover:bg-red-600" title="Stop recording">
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      )
    }

    if (recordingStatus === 'stopped' && audioBlob) {
      return (
        <div className="flex items-center w-full gap-2">
          <p className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Voice message ready
          </p>
          <p className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatTime(recordingTime)}
          </p>
          <Button type="button" variant="outline" onClick={clearRecording} className="p-2" title="Delete recording">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={handleAudioSubmit} className="p-2" title="Send voice message">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )
    }

    return (
      <>
        <Button type="button" variant="outline" size="sm" className={`flex-shrink-0 p-2 ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-600' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`} title="Attach file" disabled={disabled}>
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "KaifV1 is thinking..." : (disabled ? "Start a new chat to begin" : "Message KaifV1...")}
            className={`w-full resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            rows={1}
            disabled={loading || disabled}
            style={{ maxHeight: '200px' }}
          />
        </div>
        {message.trim() ? (
          <Button type="submit" disabled={loading || disabled} className="flex-shrink-0 p-2" title="Send message">
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleStartRecording} disabled={loading || disabled} className={`flex-shrink-0 p-2 ${permission === 'denied' ? 'cursor-not-allowed text-red-500/80 hover:text-red-500' : ''}`} title={permission === 'denied' ? 'Microphone permission denied' : 'Voice message'}>
            <Mic className="w-4 h-4" />
          </Button>
        )}
      </>
    )
  }

  return (
    <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleTextSubmit}>
          <div className={`flex items-end gap-2 p-3 rounded-2xl border-2 transition-colors ${darkMode ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500' : 'border-gray-200 bg-gray-50 focus-within:border-blue-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {renderInputState()}
          </div>
        </form>
        <div className={`flex items-center justify-between mt-2 px-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>
            {recordingStatus === 'recording' ? 'Click the mic to stop' : 'Press Enter to send, Shift+Enter for new line'}
          </span>
          <span className="hidden md:inline">
            {message.length}/4000
          </span>
        </div>
      </div>
    </div>
  )
}
