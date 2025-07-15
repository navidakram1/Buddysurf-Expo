import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase, Booking } from '../lib/supabase';

export default function BookingsScreen() {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('bookings')
        .select(`
          *,
          gigs(title, images),
          gig_packages(name, features),
          client_profile:profiles!bookings_client_id_fkey(display_name, avatar_url),
          provider_profile:profiles!bookings_provider_id_fkey(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (activeTab === 'client') {
        query = query.eq('client_id', user.id);
      } else {
        // For provider bookings, we need to join through service_providers
        const { data: providerData } = await supabase
          .from('service_providers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (providerData) {
          query = query.eq('provider_id', providerData.id);
        } else {
          setBookings([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      Alert.alert('Success', `Booking ${newStatus} successfully`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!filterStatus) return true;
    return booking.status === filterStatus;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#3b82f6';
      case 'accepted': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      case 'disputed': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTitle}>{item.gigs?.title}</Text>
          <Text style={styles.bookingPackage}>
            {item.gig_packages?.name || 'Custom Package'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {activeTab === 'client' 
              ? `Provider: ${item.provider_profile?.display_name || 'Anonymous'}`
              : `Client: ${item.client_profile?.display_name || 'Anonymous'}`
            }
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Ordered: {formatDate(item.created_at)}
          </Text>
        </View>
        
        {item.delivery_date && (
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              Due: {formatDate(item.delivery_date)}
            </Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Amount: ${item.total_amount}
          </Text>
        </View>
      </View>

      {item.requirements && (
        <View style={styles.requirements}>
          <Text style={styles.requirementsLabel}>Requirements:</Text>
          <Text style={styles.requirementsText}>{item.requirements}</Text>
        </View>
      )}

      <View style={styles.bookingActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', { bookingId: item.id })}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#22c55e" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>

        {activeTab === 'provider' && item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => updateBookingStatus(item.id, 'accepted')}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => updateBookingStatus(item.id, 'cancelled')}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'provider' && item.status === 'accepted' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => updateBookingStatus(item.id, 'in_progress')}
          >
            <Text style={styles.startButtonText}>Start Work</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'provider' && item.status === 'in_progress' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => updateBookingStatus(item.id, 'completed')}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'client' && ['pending', 'accepted'].includes(item.status || '') && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => updateBookingStatus(item.id, 'cancelled')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const statusFilters = [
    { key: null, label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'client' && styles.activeTab]}
          onPress={() => setActiveTab('client')}
        >
          <Text style={[styles.tabText, activeTab === 'client' && styles.activeTabText]}>
            My Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'provider' && styles.activeTab]}
          onPress={() => setActiveTab('provider')}
        >
          <Text style={[styles.tabText, activeTab === 'provider' && styles.activeTabText]}>
            My Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key || 'all'}
            style={[
              styles.filterButton,
              filterStatus === filter.key && styles.activeFilterButton
            ]}
            onPress={() => setFilterStatus(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              filterStatus === filter.key && styles.activeFilterButtonText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchBookings}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No bookings found</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'client' 
                ? 'Start browsing gigs to make your first order'
                : 'Create gigs to start receiving bookings'
              }
            </Text>
          </View>
        }
      />
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
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  filtersContainer: {
    maxHeight: 50,
    backgroundColor: '#f9fafb',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  bookingsList: {
    padding: 20,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  bookingPackage: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  requirements: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requirementsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  chatButtonText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  declineButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
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
});
