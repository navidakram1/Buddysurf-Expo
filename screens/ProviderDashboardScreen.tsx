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
import { supabase, Gig, Booking, ServiceProvider } from '../lib/supabase';

export default function ProviderDashboardScreen() {
  const navigation = useNavigation();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gigs' | 'bookings' | 'analytics'>('overview');

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError && providerError.code !== 'PGRST116') {
        throw providerError;
      }

      if (providerData) {
        setProvider(providerData);
        
        // Fetch gigs
        const { data: gigsData, error: gigsError } = await supabase
          .from('gigs')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (gigsError) throw gigsError;
        setGigs(gigsData || []);

        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            gigs(title),
            client_profile:profiles!bookings_client_id_fkey(display_name)
          `)
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);

        // Calculate earnings
        const completedBookings = bookingsData?.filter(b => b.status === 'completed') || [];
        const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
        const thisMonth = completedBookings
          .filter(b => new Date(b.created_at).getMonth() === new Date().getMonth())
          .reduce((sum, booking) => sum + booking.total_amount, 0);
        const pendingEarnings = bookingsData
          ?.filter(b => ['accepted', 'in_progress'].includes(b.status || ''))
          .reduce((sum, booking) => sum + booking.total_amount, 0) || 0;

        setEarnings({
          total: totalEarnings,
          thisMonth,
          pending: pendingEarnings,
        });
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const createProviderProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          name: 'Your Service Name',
          bio: 'Tell clients about your services...',
          services: [],
          hourly_rate: 25,
        });

      if (error) throw error;
      fetchProviderData();
    } catch (error) {
      console.error('Error creating provider profile:', error);
      Alert.alert('Error', 'Failed to create provider profile');
    }
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${earnings.total.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${earnings.thisMonth.toFixed(2)}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{gigs.length}</Text>
          <Text style={styles.statLabel}>Active Gigs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{provider?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color="#22c55e" />
            <Text style={styles.actionButtonText}>Create Gig</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="analytics" size={24} color="#3b82f6" />
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={24} color="#6b7280" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Bookings */}
      <View style={styles.recentBookings}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {bookings.slice(0, 3).map((booking) => (
          <View key={booking.id} style={styles.bookingItem}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle}>{booking.gigs?.title}</Text>
              <Text style={styles.bookingClient}>
                {booking.client_profile?.display_name || 'Anonymous'}
              </Text>
            </View>
            <View style={styles.bookingStatus}>
              <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                {booking.status?.toUpperCase()}
              </Text>
              <Text style={styles.bookingAmount}>${booking.total_amount}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderGigs = () => (
    <View style={styles.gigsContainer}>
      <View style={styles.gigsHeader}>
        <Text style={styles.sectionTitle}>My Gigs ({gigs.length})</Text>
        <TouchableOpacity style={styles.createGigButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createGigText}>Create Gig</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={gigs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gigCard}>
            <View style={styles.gigHeader}>
              <Text style={styles.gigTitle}>{item.title}</Text>
              <View style={[styles.gigStatus, { backgroundColor: getGigStatusColor(item.status) }]}>
                <Text style={styles.gigStatusText}>{item.status?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.gigDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.gigFooter}>
              <Text style={styles.gigPrice}>From ${item.base_price}</Text>
              <View style={styles.gigActions}>
                <TouchableOpacity style={styles.gigAction}>
                  <Ionicons name="create" size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.gigAction}>
                  <Ionicons name="eye" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getGigStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'paused': return '#f59e0b';
      case 'draft': return '#6b7280';
      default: return '#d1d5db';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.setupContainer}>
        <Ionicons name="briefcase" size={64} color="#6b7280" />
        <Text style={styles.setupTitle}>Become a Service Provider</Text>
        <Text style={styles.setupDescription}>
          Create your provider profile to start offering services and earning money.
        </Text>
        <TouchableOpacity style={styles.setupButton} onPress={createProviderProfile}>
          <Text style={styles.setupButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home' },
          { key: 'gigs', label: 'Gigs', icon: 'briefcase' },
          { key: 'bookings', label: 'Bookings', icon: 'calendar' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics' },
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

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'gigs' && renderGigs()}
        {activeTab === 'bookings' && (
          <View style={styles.placeholder}>
            <Text>Bookings management coming soon...</Text>
          </View>
        )}
        {activeTab === 'analytics' && (
          <View style={styles.placeholder}>
            <Text>Analytics dashboard coming soon...</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  setupDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  setupButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  setupButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
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
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  recentBookings: {},
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  bookingClient: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  gigsContainer: {
    padding: 20,
  },
  gigsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createGigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  createGigText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  gigCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  gigStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gigStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  gigDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  gigFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gigPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  gigActions: {
    flexDirection: 'row',
    gap: 10,
  },
  gigAction: {
    padding: 8,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});
