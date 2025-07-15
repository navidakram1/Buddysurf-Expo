import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { authService } from '../lib/auth';
import { useFileUpload } from '../hooks/useFileUpload';

interface RouteParams {
  userId?: string;
}

export default function ProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = (route.params as RouteParams) || {};
  const { pickImage, uploadFile, uploading } = useFileUpload();
  
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      const targetUserId = userId || currentUser?.id;
      
      if (!targetUserId) return;
      
      setIsOwnProfile(!userId || userId === currentUser?.id);
      
      const profileData = await authService.getProfile(targetUserId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async () => {
    try {
      const image = await pickImage({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!image) return;

      const result = await uploadFile(
        image.uri,
        'avatars',
        `avatar_${Date.now()}.jpg`
      );

      await authService.updateProfile({
        avatar_url: result.url,
      });

      setProfile((prev: any) => ({ ...prev, avatar_url: result.url }));
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const stats = [
    { label: 'Activities', value: '12' },
    { label: 'Connections', value: '28' },
    { label: 'Reviews', value: '4.8' },
  ];

  const activities = [
    { id: '1', title: 'Beach Volleyball', date: '2024-01-15', status: 'completed' },
    { id: '2', title: 'Hiking Group', date: '2024-01-20', status: 'upcoming' },
    { id: '3', title: 'Coffee Meetup', date: '2024-01-10', status: 'completed' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isOwnProfile ? handleAvatarUpdate : undefined}
        >
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#9ca3af" />
            </View>
          )}
          {isOwnProfile && (
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          )}
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <Ionicons name="hourglass" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.displayName}>
          {profile?.display_name || 'Unknown User'}
        </Text>
        
        {profile?.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}

        {isOwnProfile ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="create-outline" size={20} color="#22c55e" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.connectButton}>
              <Ionicons name="person-add-outline" size={20} color="#22c55e" />
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons 
                name={activity.status === 'completed' ? 'checkmark-circle' : 'time'} 
                size={24} 
                color={activity.status === 'completed' ? '#22c55e' : '#f59e0b'} 
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDate}>
                {new Date(activity.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              activity.status === 'completed' ? styles.completedBadge : styles.upcomingBadge
            ]}>
              <Text style={[
                styles.statusText,
                activity.status === 'completed' ? styles.completedText : styles.upcomingText
              ]}>
                {activity.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>Sarah M.</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color="#f59e0b"
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewText}>
            Great person to hang out with! Very friendly and organized activities well.
          </Text>
          <Text style={styles.reviewDate}>2 weeks ago</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22c55e',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 20,
  },
  editButtonText: {
    marginLeft: 8,
    color: '#22c55e',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageButtonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '500',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectButtonText: {
    marginLeft: 8,
    color: '#22c55e',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  activityDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  upcomingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  completedText: {
    color: '#166534',
  },
  upcomingText: {
    color: '#92400e',
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
