import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Message, Conversation } from '../types'

const WEBHOOK_URL = 'https://proiu.app.n8n.cloud/webhook/82edde5e-5bca-4635-86d5-7b7580005c74'

export const useChat = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const fetchConversations = useCallback(async () => {
    if (!user) return
    setLoadingHistory(true)
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching conversations:', error)
    else setConversations(data || [])
    setLoadingHistory(false)
  }, [user])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessages([])
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) console.error('Error fetching messages:', error)
    else setMessages(data.map(m => ({ ...m, timestamp: new Date(m.created_at) })) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
    } else {
      setMessages([])
    }
  }, [selectedConversationId, fetchMessages])

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    if (message.includes('hello') || message.includes('hi')) return "Hello! I'm delighted to meet you. I'm KaifV1, and I'm here to help with whatever you need. What would you like to explore together?"
    if (message.includes('help')) return "I can answer questions, brainstorm ideas, and much more. What's on your mind?"
    if (message.includes('thank')) return "You're very welcome! I'm glad I could help."
    if (message.includes('bye')) return "Goodbye! It was wonderful chatting with you."
    return `Thank you for sharing that. Could you tell me more about "${userMessage}"? I'm here to help.`
  }

  const sendToWebhook = async (payload: any) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const contentType = response.headers.get('content-type')
      return { data: contentType?.includes('application/json') ? await response.json() : await response.text(), status: response.status }
    } catch (error: any) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  const handleNewConversation = async (firstMessage: string): Promise<Conversation | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: firstMessage.substring(0, 50) })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    return data;
  };

  const sendMessage = async (content: string) => {
    if (!user) return;

    let convId = selectedConversationId;
    
    if (!convId) {
      setLoading(true);
      const newConversation = await handleNewConversation(content);
      if (!newConversation) {
        setLoading(false);
        return;
      }
      convId = newConversation.id;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      setMessages([]);
    }

    const userMessage: Message = { 
      id: Date.now().toString(), 
      conversation_id: convId, 
      content, 
      is_user: true, 
      timestamp: new Date(), 
      type: 'text' 
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    await supabase.from('messages').insert({ 
      conversation_id: convId, 
      user_id: user.id, 
      content, 
      is_user: true, 
      type: 'text' 
    });

    try {
      const response = await sendToWebhook({ message: content, user_id: user.id, conversation_id: convId });
      let aiResponseContent = '';
      if (response.data) {
        if (typeof response.data === 'string') {
          aiResponseContent = response.data;
        } else if (typeof response.data === 'object') {
          const fields = ['message', 'response', 'text', 'content', 'reply', 'output'];
          const foundField = fields.find(field => response.data[field]);
          aiResponseContent = foundField ? response.data[foundField] : JSON.stringify(response.data, null, 2);
        }
      }
      if (!aiResponseContent) {
        aiResponseContent = getAIResponse(content);
      }
      
      const aiMessage = { 
        conversation_id: convId, 
        user_id: user.id, 
        content: aiResponseContent, 
        is_user: false, 
        type: 'text' 
      };
      
      const { data } = await supabase.from('messages').insert(aiMessage).select().single();
      if (data) {
        setMessages(prev => [...prev, { ...data, timestamp: new Date(data.created_at) }]);
      }
    } catch (error) {
      const fallbackContent = getAIResponse(content);
      const { data } = await supabase.from('messages').insert({ 
        conversation_id: convId, 
        user_id: user.id, 
        content: fallbackContent, 
        is_user: false, 
        type: 'text' 
      }).select().single();
      
      if (data) {
        setMessages(prev => [...prev, { ...data, timestamp: new Date(data.created_at) }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob, duration: number) => {
    if (!user) return
    let currentConversationId = selectedConversationId
    if (!currentConversationId) {
      const newConversation = await handleNewConversation("Voice Message")
      if (!newConversation) return
      currentConversationId = newConversation.id
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      setMessages([]);
    }

    const audioUrl = URL.createObjectURL(audioBlob)
    const tempId = Date.now().toString()
    const userMessage: Message = { id: tempId, conversation_id: currentConversationId, content: 'Voice message', is_user: true, timestamp: new Date(), type: 'audio', audio_url: audioUrl, audioDuration: duration }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    const fileName = `${user.id}/${currentConversationId}/${Date.now()}.webm`
    const { error: uploadError } = await supabase.storage.from('voice_messages').upload(fileName, audioBlob)
    if (uploadError) {
      console.error('Error uploading audio:', uploadError)
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('voice_messages').getPublicUrl(fileName)
    await supabase.from('messages').insert({ conversation_id: currentConversationId, user_id: user.id, content: 'Voice message', is_user: true, type: 'audio', audio_url: publicUrl })

    const aiResponseContent = "I've received your voice message. While I'm still learning to process audio, I appreciate you sharing it!"
    const { data } = await supabase.from('messages').insert({ conversation_id: currentConversationId, user_id: user.id, content: aiResponseContent, is_user: false, type: 'text' }).select().single()
    if (data) setMessages(prev => [...prev, { ...data, timestamp: new Date(data.created_at) }])
    setLoading(false)
  }

  const newChat = () => {
    setSelectedConversationId(null)
    setMessages([])
  }

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase.from('conversations').delete().eq('id', conversationId)
    if (error) console.error('Error deleting conversation:', error)
    else {
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      if (selectedConversationId === conversationId) {
        newChat()
      }
    }
  }
  
  const deleteAllChats = async () => {
    if (!user) return
    const { error } = await supabase.from('conversations').delete().eq('user_id', user.id)
    if (error) console.error('Error deleting all chats:', error)
    else {
      setConversations([])
      newChat()
    }
  }

  return {
    user,
    conversations,
    messages,
    selectedConversationId,
    loading,
    loadingHistory,
    selectConversation: setSelectedConversationId,
    newChat,
    sendMessage,
    sendAudioMessage,
    deleteConversation,
    deleteAllChats,
  }
}
