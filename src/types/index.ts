export interface Message {
  id: string
  conversation_id: string
  content: string
  is_user: boolean
  timestamp: Date
  type?: 'text' | 'audio'
  audio_url?: string
  audioDuration?: number
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}
