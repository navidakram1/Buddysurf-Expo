import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase, Activity, Profile } from '../lib/supabase';

export default function ActivityDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    fetchActivityDetails();
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchActivityDetails = async () => {
    try {
      // Fetch activity details
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select(`
          *,
          categories(name, icon, color),
          profiles(display_name, avatar_url, username)
        `)
        .eq('id', id)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('activity_participants')
        .select(`
          *,
          profiles(id, display_name, avatar_url, username)
        `)
        .eq('activity_id', id)
        .eq('status', 'joined');

      if (participantsError) throw participantsError;
      
      const participantProfiles = participantsData.map(p => p.profiles).filter(Boolean);
      setParticipants(participantProfiles);

      // Check if current user is joined
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userParticipation = participantsData.find(p => p.profiles?.id === user.id);
        setIsJoined(!!userParticipation);
      }

    } catch (error) {
      console.error('Error fetching activity details:', error);
      Alert.alert('Error', 'Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinActivity = async () => {
    if (!currentUser || !activity) return;

    try {
      if (isJoined) {
        // Leave activity
        const { error } = await supabase
          .from('activity_participants')
          .delete()
          .eq('activity_id', activity.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        setIsJoined(false);
        Alert.alert('Success', 'You have left the activity');
      } else {
        // Join activity
        const { error } = await supabase
          .from('activity_participants')
          .insert({
            activity_id: activity.id,
            user_id: currentUser.id,
            status: 'joined'
          });

        if (error) throw error;
        setIsJoined(true);
        Alert.alert('Success', 'You have joined the activity!');
      }
      
      fetchActivityDetails(); // Refresh data
    } catch (error) {
      console.error('Error joining/leaving activity:', error);
      Alert.alert('Error', 'Failed to update participation');
    }
  };

  const handleShare = async () => {
    if (!activity) return;
    
    try {
      await Share.share({
        message: `Check out this activity: ${activity.title}\n\n${activity.description}\n\nJoin us on BuddySurf!`,
        title: activity.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isHost = currentUser && activity && activity.host_id === currentUser.id;
  const canJoin = !isHost && participants.length < (activity?.max_participants || 10);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.errorContainer}>
        <Text>Activity not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Activity Info */}
      <View style={styles.activityInfo}>
        <Text style={styles.title}>{activity.title}</Text>
        
        <View style={styles.hostInfo}>
          <Text style={styles.hostLabel}>Hosted by</Text>
          <Text style={styles.hostName}>{activity.profiles?.display_name || 'Anonymous'}</Text>
        </View>

        <Text style={styles.description}>{activity.description}</Text>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color="#22c55e" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>When</Text>
              <Text style={styles.detailValue}>{formatDate(activity.start_time)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location" size={20} color="#22c55e" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Where</Text>
              <Text style={styles.detailValue}>{activity.address || 'Location TBD'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="people" size={20} color="#22c55e" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Participants</Text>
              <Text style={styles.detailValue}>
                {participants.length}/{activity.max_participants || 10}
              </Text>
            </View>
          </View>

          {activity.is_paid && (
            <View style={styles.detailItem}>
              <Ionicons name="card" size={20} color="#22c55e" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>${activity.price}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Participants Section */}
      <View style={styles.participantsSection}>
        <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.participantsList}>
            {participants.map((participant, index) => (
              <View key={index} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  {participant.avatar_url ? (
                    <Image source={{ uri: participant.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={20} color="#6b7280" />
                  )}
                </View>
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.display_name || participant.username || 'Anonymous'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', { activityId: activity.id })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#22c55e" />
          <Text style={styles.chatButtonText}>Activity Chat</Text>
        </TouchableOpacity>

        {!isHost && (
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined && styles.leaveButton,
              !canJoin && !isJoined && styles.disabledButton
            ]}
            onPress={handleJoinActivity}
            disabled={!canJoin && !isJoined}
          >
            <Text style={[
              styles.joinButtonText,
              isJoined && styles.leaveButtonText
            ]}>
              {isJoined ? 'Leave Activity' : canJoin ? 'Join Activity' : 'Activity Full'}
            </Text>
          </TouchableOpacity>
        )}

        {isHost && (
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Activity</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  activityInfo: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 5,
  },
  hostLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  hostName: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 25,
  },
  detailsGrid: {
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginTop: 2,
  },
  participantsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  participantsList: {
    flexDirection: 'row',
    gap: 15,
  },
  participantItem: {
    alignItems: 'center',
    width: 70,
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  participantName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButtons: {
    padding: 20,
    gap: 10,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  joinButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  leaveButtonText: {
    color: 'white',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
