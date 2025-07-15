import { useState, useEffect, useCallback } from 'react';
import { supabase, Message, Conversation } from '../lib/supabase';
import { authService } from '../lib/auth';

export function useRealtimeChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      setupMessageSubscription(conversationId);
    } else {
      fetchConversations();
    }
  }, [conversationId]);

  const fetchMessages = async (convId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            *,
            messages (
              content,
              created_at,
              sender_id
            )
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const conversationsData = data?.map(cp => ({
        ...cp.conversations,
        last_message: cp.conversations?.messages?.[0]?.content,
        last_message_at: cp.conversations?.messages?.[0]?.created_at,
      })) || [];

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupMessageSubscription = (convId: string) => {
    const subscription = supabase
      .channel(`conversation:${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`
      }, async (payload) => {
        // Fetch the complete message with profile data
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:sender_id (
              display_name,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          setMessages(prev => [...prev, data]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = useCallback(async (content: string, conversationId: string) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          conversation_id: conversationId,
          message_type: 'text',
        });

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  }, []);

  const createConversation = useCallback(async (participantIds: string[], type: 'direct' | 'group' = 'direct') => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const allParticipants = [user.id, ...participantIds.filter(id => id !== user.id)];

      // Create conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          type,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(
          allParticipants.map(userId => ({
            conversation_id: conversation.id,
            user_id: userId,
          }))
        );

      if (participantsError) throw participantsError;

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      await supabase
        .from('conversation_participants')
        .update({
          last_read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  return {
    messages,
    conversations,
    loading,
    sending,
    sendMessage,
    createConversation,
    markAsRead,
    refetch: conversationId ? () => fetchMessages(conversationId) : fetchConversations,
  };
}
