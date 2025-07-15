import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase, Profile } from '../lib/supabase';

export default function NetworkScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'followers'>('discover');
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    fetchUsers();
  }, [activeTab]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'discover') {
        // Fetch all users for discovery
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUser?.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setUsers(data || []);
      } else {
        // For following/followers, we would need a connections table
        // For now, showing empty state
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    return (
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleFollow = async (userId: string) => {
    // In a real app, you would implement a connections/follows table
    Alert.alert('Feature Coming Soon', 'Follow functionality will be implemented with a connections table');
  };

  const handleMessage = (userId: string) => {
    navigation.navigate('Chat', { userId });
  };

  const renderUserCard = ({ item }: { item: Profile }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={24} color="#6b7280" />
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.display_name || item.username || 'Anonymous'}
          </Text>
          {item.username && item.display_name && (
            <Text style={styles.userHandle}>@{item.username}</Text>
          )}
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
        </View>
        
        {item.is_verified && (
          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
        )}
      </View>

      {/* User Stats */}
      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      {/* Vibes/Interests */}
      {item.vibes && item.vibes.length > 0 && (
        <View style={styles.vibesContainer}>
          <Text style={styles.vibesLabel}>Interests:</Text>
          <View style={styles.vibes}>
            {item.vibes.slice(0, 3).map((vibe, index) => (
              <View key={index} style={styles.vibeTag}>
                <Text style={styles.vibeText}>{vibe}</Text>
              </View>
            ))}
            {item.vibes.length > 3 && (
              <Text style={styles.moreVibes}>+{item.vibes.length - 3} more</Text>
            )}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.followButton}
          onPress={() => handleFollow(item.id)}
        >
          <Ionicons name="person-add" size={16} color="white" />
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessage(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#22c55e" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile', { userId: item.id })}
        >
          <Ionicons name="eye-outline" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={
          activeTab === 'discover' ? 'people-outline' :
          activeTab === 'following' ? 'heart-outline' :
          'person-outline'
        } 
        size={64} 
        color="#d1d5db" 
      />
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'discover' ? 'No users found' :
         activeTab === 'following' ? 'Not following anyone yet' :
         'No followers yet'}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'discover' ? 'Try adjusting your search terms' :
         activeTab === 'following' ? 'Start following people to see them here' :
         'Share your profile to gain followers'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'discover', label: 'Discover', icon: 'compass' },
          { key: 'following', label: 'Following', icon: 'heart' },
          { key: 'followers', label: 'Followers', icon: 'people' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? '#22c55e' : '#6b7280'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      {activeTab === 'discover' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchUsers}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Quick Actions */}
      {activeTab === 'discover' && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="location" size={20} color="#22c55e" />
            <Text style={styles.quickActionText}>Find Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="filter" size={20} color="#3b82f6" />
            <Text style={styles.quickActionText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="share" size={20} color="#8b5cf6" />
            <Text style={styles.quickActionText}>Invite Friends</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  usersList: {
    padding: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vibesContainer: {
    marginBottom: 12,
  },
  vibesLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  vibes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  vibeTag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  vibeText: {
    fontSize: 11,
    color: '#22c55e',
  },
  moreVibes: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  followButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  messageButtonText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  profileButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
