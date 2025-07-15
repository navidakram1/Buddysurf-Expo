import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase, Message } from '../lib/supabase';

interface ChatMessage extends Message {
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export default function SimpleChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // For demo purposes, we'll use a fixed conversation ID
  const DEMO_CONVERSATION_ID = 'demo-conversation-123';

  useEffect(() => {
    getCurrentUser();
    loadDemoMessages();
    setupRealtimeSubscription();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadDemoMessages = () => {
    // Demo messages for testing
    const demoMessages: ChatMessage[] = [
      {
        id: '1',
        conversation_id: DEMO_CONVERSATION_ID,
        sender_id: 'demo-user-1',
        content: 'Hey! How are you doing?',
        message_type: 'text',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        profiles: {
          display_name: 'Demo User',
        },
      },
      {
        id: '2',
        conversation_id: DEMO_CONVERSATION_ID,
        sender_id: 'current-user',
        content: 'I\'m doing great! Thanks for asking.',
        message_type: 'text',
        created_at: new Date(Date.now() - 3000000).toISOString(),
        updated_at: new Date(Date.now() - 3000000).toISOString(),
        profiles: {
          display_name: 'You',
        },
      },
      {
        id: '3',
        conversation_id: DEMO_CONVERSATION_ID,
        sender_id: 'demo-user-1',
        content: 'Are you available for the meetup tomorrow?',
        message_type: 'text',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        profiles: {
          display_name: 'Demo User',
        },
      },
    ];
    setMessages(demoMessages);
  };

  const setupRealtimeSubscription = () => {
    // In a real app, this would subscribe to real-time message updates
    console.log('Setting up real-time subscription for demo chat');
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      // Create new message object
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        conversation_id: DEMO_CONVERSATION_ID,
        sender_id: currentUser?.id || 'current-user',
        content: messageText,
        message_type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profiles: {
          display_name: 'You',
        },
      };

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMsg]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // In a real app, you would send this to Supabase:
      /*
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: DEMO_CONVERSATION_ID,
          sender_id: currentUser.id,
          content: messageText,
          message_type: 'text'
        });

      if (error) throw error;
      */

      // Simulate a response after 2 seconds
      setTimeout(() => {
        const responseMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversation_id: DEMO_CONVERSATION_ID,
          sender_id: 'demo-user-1',
          content: 'Thanks for your message! This is a demo response.',
          message_type: 'text',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: {
            display_name: 'Demo User',
          },
        };
        setMessages(prev => [...prev, responseMsg]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = item.sender_id === (currentUser?.id || 'current-user');
    const showAvatar = index === 0 || messages[index - 1].sender_id !== item.sender_id;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && showAvatar && (
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#6b7280" />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {!isCurrentUser && showAvatar && (
            <Text style={styles.senderName}>
              {item.profiles?.display_name || 'Anonymous'}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
        
        {isCurrentUser && showAvatar && (
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#22c55e" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Simple Chat Demo</Text>
          <Text style={styles.headerSubtitle}>Testing Interface</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="information-circle-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || loading}
        >
          <Ionicons 
            name={loading ? "hourglass" : "send"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Demo Info */}
      <View style={styles.demoInfo}>
        <Text style={styles.demoText}>
          📱 This is a demo chat interface. Messages are simulated locally.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  headerAction: {
    marginLeft: 15,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: '#22c55e',
    borderBottomRightRadius: 5,
  },
  otherUserBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherUserTime: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#1f2937',
  },
  attachButton: {
    marginLeft: 10,
    padding: 5,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  demoInfo: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#fbbf24',
  },
  demoText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
});
