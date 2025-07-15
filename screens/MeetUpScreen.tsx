import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';
import { activitiesService } from '../lib/activities';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: any;
  max_participants: number;
  current_participants: number;
  host_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  host?: {
    display_name: string;
    avatar_url?: string;
  };
}

const categories = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'sports', name: 'Sports', icon: 'basketball' },
  { id: 'social', name: 'Social', icon: 'people' },
  { id: 'food', name: 'Food', icon: 'restaurant' },
  { id: 'outdoor', name: 'Outdoor', icon: 'leaf' },
  { id: 'learning', name: 'Learning', icon: 'book' },
];

export default function MeetUpScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, selectedCategory, searchQuery]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          categories (
            name,
            icon,
            color
          ),
          profiles:host_id (
            display_name,
            avatar_url,
            is_verified
          ),
          activity_participants (
            id,
            user_id,
            status
          )
        `)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Calculate current participants for each activity
      const activitiesWithCounts = data?.map(activity => ({
        ...activity,
        current_participants: activity.activity_participants?.filter(p => p.status === 'joined').length || 0,
        category: activity.categories?.name || 'general',
      })) || [];

      setActivities(activitiesWithCounts);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('activities_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const filterActivities = () => {
    let filtered = activities;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => 
        activity.category.toLowerCase() === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const joinActivity = async (activityId: string) => {
    try {
      await activitiesService.joinActivity(activityId);
      Alert.alert('Success', 'You have joined the activity!');
      fetchActivities();
    } catch (error: any) {
      console.error('Error joining activity:', error);
      Alert.alert('Error', error.message || 'Failed to join activity');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      sports: '#ef4444',
      social: '#3b82f6',
      food: '#f59e0b',
      outdoor: '#10b981',
      learning: '#8b5cf6',
    };
    return colors[category.toLowerCase()] || '#6b7280';
  };

  const renderActivityCard = (activity: Activity) => (
    <View key={activity.id} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[
          styles.categoryBadge,
          { backgroundColor: getCategoryColor(activity.category) }
        ]}>
          <Text style={styles.categoryText}>{activity.category}</Text>
        </View>
        <Text style={styles.activityTime}>
          {formatDate(activity.start_time)}
        </Text>
      </View>

      <Text style={styles.activityTitle}>{activity.title}</Text>
      <Text style={styles.activityDescription} numberOfLines={2}>
        {activity.description}
      </Text>

      <View style={styles.activityMeta}>
        <View style={styles.hostInfo}>
          <Ionicons name="person-circle" size={20} color="#6b7280" />
          <Text style={styles.hostName}>
            {activity.host?.display_name || 'Unknown Host'}
          </Text>
        </View>
        <Text style={styles.participantCount}>
          {activity.current_participants}/{activity.max_participants} joined
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.joinButton,
          activity.current_participants >= activity.max_participants && styles.joinButtonDisabled
        ]}
        onPress={() => joinActivity(activity.id)}
        disabled={activity.current_participants >= activity.max_participants}
      >
        <Ionicons 
          name={activity.current_participants >= activity.max_participants ? "checkmark" : "add"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.joinButtonText}>
          {activity.current_participants >= activity.max_participants ? 'Full' : 'Join'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MeetUp</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? 'white' : '#22c55e'} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Activities List */}
      <ScrollView style={styles.activitiesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading activities...</Text>
          </View>
        ) : filteredActivities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or create a new activity
            </Text>
          </View>
        ) : (
          filteredActivities.map(renderActivityCard)
        )}
      </ScrollView>

      {/* Create Activity Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Activity</Text>
            <TouchableOpacity>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalPlaceholder}>
              Activity creation form would go here...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#22c55e',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22c55e',
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    backgroundColor: '#22c55e',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#22c55e',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  activitiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  participantCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  joinButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancel: {
    fontSize: 16,
    color: '#ef4444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPlaceholder: {
    fontSize: 16,
    color: '#6b7280',
  },
});
