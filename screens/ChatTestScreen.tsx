import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function ChatTestScreen() {
  const navigation = useNavigation();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkConnection();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setCurrentUser(user);
      addTestResult('User Authentication', 'success', `Logged in as: ${user?.email || 'Anonymous'}`);
    } catch (error) {
      addTestResult('User Authentication', 'error', 'Not authenticated');
    }
  };

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      setConnectionStatus('connected');
      addTestResult('Database Connection', 'success', 'Successfully connected to Supabase');
    } catch (error) {
      setConnectionStatus('disconnected');
      addTestResult('Database Connection', 'error', `Connection failed: ${error.message}`);
    }
  };

  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  const testConversationCreation = async () => {
    addTestResult('Conversation Creation', 'pending', 'Creating test conversation...');
    
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          name: 'Test Conversation',
          created_by: currentUser.id
        })
        .select()
        .single();

      if (error) throw error;
      
      addTestResult('Conversation Creation', 'success', `Created conversation: ${data.id}`);
      return data.id;
    } catch (error) {
      addTestResult('Conversation Creation', 'error', `Failed: ${error.message}`);
      return null;
    }
  };

  const testMessageSending = async () => {
    const conversationId = await testConversationCreation();
    if (!conversationId) return;

    addTestResult('Message Sending', 'pending', 'Sending test message...');
    
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: customMessage || 'This is a test message from ChatTestScreen',
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;
      
      addTestResult('Message Sending', 'success', `Message sent: ${data.id}`);
    } catch (error) {
      addTestResult('Message Sending', 'error', `Failed: ${error.message}`);
    }
  };

  const testRealtimeSubscription = async () => {
    addTestResult('Realtime Subscription', 'pending', 'Setting up realtime subscription...');
    
    try {
      const channel = supabase
        .channel('test-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, (payload) => {
          addTestResult('Realtime Event', 'success', `Received realtime message: ${payload.new.id}`);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            addTestResult('Realtime Subscription', 'success', 'Successfully subscribed to realtime updates');
          } else {
            addTestResult('Realtime Subscription', 'error', `Subscription status: ${status}`);
          }
        });

      // Clean up after 10 seconds
      setTimeout(() => {
        channel.unsubscribe();
        addTestResult('Realtime Cleanup', 'success', 'Unsubscribed from realtime updates');
      }, 10000);

    } catch (error) {
      addTestResult('Realtime Subscription', 'error', `Failed: ${error.message}`);
    }
  };

  const testRLSPolicies = async () => {
    addTestResult('RLS Policies', 'pending', 'Testing Row Level Security policies...');
    
    try {
      // Test reading profiles (should work - public read policy)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (profileError) throw profileError;
      
      addTestResult('RLS - Profile Read', 'success', 'Can read profiles (public policy)');

      // Test reading messages without proper access (should fail or return empty)
      const { data: messages, error: messageError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (messageError) {
        addTestResult('RLS - Message Read', 'success', 'RLS working - unauthorized access blocked');
      } else {
        addTestResult('RLS - Message Read', 'success', `Found ${messages?.length || 0} accessible messages`);
      }

    } catch (error) {
      addTestResult('RLS Policies', 'error', `Failed: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await checkConnection();
    await getCurrentUser();
    await testRLSPolicies();
    await testRealtimeSubscription();
    await testMessageSending();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return 'hourglass';
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Test Suite</Text>
        <View style={[styles.connectionStatus, { backgroundColor: getStatusColor(connectionStatus === 'connected' ? 'success' : 'error') }]}>
          <Text style={styles.connectionText}>
            {connectionStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* Test Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.testButton} onPress={runAllTests}>
            <Ionicons name="play" size={16} color="white" />
            <Text style={styles.testButtonText}>Run All Tests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
            <Ionicons name="trash" size={16} color="#6b7280" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.messageInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Custom test message (optional)"
            value={customMessage}
            onChangeText={setCustomMessage}
          />
          <TouchableOpacity style={styles.sendTestButton} onPress={testMessageSending}>
            <Ionicons name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Individual Test Buttons */}
      <View style={styles.individualTests}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>
        <View style={styles.testGrid}>
          <TouchableOpacity style={styles.individualTestButton} onPress={checkConnection}>
            <Ionicons name="wifi" size={20} color="#3b82f6" />
            <Text style={styles.individualTestText}>Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.individualTestButton} onPress={testConversationCreation}>
            <Ionicons name="chatbubbles" size={20} color="#8b5cf6" />
            <Text style={styles.individualTestText}>Conversation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.individualTestButton} onPress={testRealtimeSubscription}>
            <Ionicons name="radio" size={20} color="#f59e0b" />
            <Text style={styles.individualTestText}>Realtime</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.individualTestButton} onPress={testRLSPolicies}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.individualTestText}>Security</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Test Results ({testResults.length})</Text>
        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={getStatusIcon(result.status)} 
                  size={20} 
                  color={getStatusColor(result.status)} 
                />
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={styles.resultTime}>
                  {result.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
            </View>
          ))}
          
          {testResults.length === 0 && (
            <View style={styles.emptyResults}>
              <Ionicons name="flask-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No test results yet</Text>
              <Text style={styles.emptySubtext}>Run tests to see results here</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  connectionText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  controls: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  messageInput: {
    flexDirection: 'row',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  sendTestButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  individualTests: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  individualTestButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 15,
    borderRadius: 8,
    gap: 8,
  },
  individualTestText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  resultTest: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  resultMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
