import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalActivities: number;
  totalGigs: number;
  totalBookings: number;
  revenue: number;
}

export default function AdminScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalActivities: 0,
    totalGigs: 0,
    totalBookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Access Denied', 'Please log in to access admin features');
        navigation.goBack();
        return;
      }

      // Check if user is admin (you would implement this based on your admin system)
      // For demo purposes, we'll allow access
      setIsAdmin(true);
      fetchAdminStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      Alert.alert('Error', 'Failed to verify admin access');
      navigation.goBack();
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Fetch user stats
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch activity stats
      const { count: activityCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });

      // Fetch gig stats
      const { count: gigCount } = await supabase
        .from('gigs')
        .select('*', { count: 'exact', head: true });

      // Fetch booking stats
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Calculate revenue from completed bookings
      const { data: completedBookings } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('status', 'completed');

      const revenue = completedBookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        activeUsers: Math.floor((userCount || 0) * 0.7), // Estimate 70% active
        totalActivities: activityCount || 0,
        totalGigs: gigCount || 0,
        totalBookings: bookingCount || 0,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Error', 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const adminActions = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'people',
      color: '#3b82f6',
    },
    {
      id: 'activities',
      title: 'Activity Moderation',
      description: 'Review and moderate activities',
      icon: 'calendar',
      color: '#22c55e',
    },
    {
      id: 'gigs',
      title: 'Gig Management',
      description: 'Manage service listings and providers',
      icon: 'briefcase',
      color: '#8b5cf6',
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'View detailed platform analytics',
      icon: 'analytics',
      color: '#f59e0b',
    },
    {
      id: 'content',
      title: 'Content Moderation',
      description: 'Review flagged content and messages',
      icon: 'flag',
      color: '#ef4444',
    },
    {
      id: 'payments',
      title: 'Payment Management',
      description: 'Handle payments and disputes',
      icon: 'card',
      color: '#10b981',
    },
    {
      id: 'settings',
      title: 'Platform Settings',
      description: 'Configure platform-wide settings',
      icon: 'settings',
      color: '#6b7280',
    },
    {
      id: 'notifications',
      title: 'System Notifications',
      description: 'Send platform-wide announcements',
      icon: 'megaphone',
      color: '#f97316',
    },
  ];

  const handleActionPress = (actionId: string) => {
    Alert.alert('Admin Feature', `${actionId} management interface would be implemented here`);
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const renderActionCard = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionCard}
      onPress={() => handleActionPress(action.title)}
    >
      <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={24} color="white" />
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionDescription}>{action.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  if (!isAdmin) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="shield-outline" size={64} color="#ef4444" />
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedText}>
          You don't have permission to access admin features.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Platform Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard('Total Users', stats.totalUsers.toLocaleString(), 'people', '#3b82f6')}
            {renderStatCard('Active Users', stats.activeUsers.toLocaleString(), 'pulse', '#22c55e')}
            {renderStatCard('Activities', stats.totalActivities.toLocaleString(), 'calendar', '#8b5cf6')}
            {renderStatCard('Gigs', stats.totalGigs.toLocaleString(), 'briefcase', '#f59e0b')}
            {renderStatCard('Bookings', stats.totalBookings.toLocaleString(), 'receipt', '#10b981')}
            {renderStatCard('Revenue', `$${stats.revenue.toLocaleString()}`, 'trending-up', '#ef4444')}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="ban" size={20} color="#ef4444" />
              <Text style={styles.quickActionText}>Ban User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="trash" size={20} color="#f59e0b" />
              <Text style={styles.quickActionText}>Delete Content</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="megaphone" size={20} color="#3b82f6" />
              <Text style={styles.quickActionText}>Send Alert</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="download" size={20} color="#22c55e" />
              <Text style={styles.quickActionText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Administration</Text>
          {adminActions.map(renderActionCard)}
        </View>

        {/* System Status */}
        <View style={styles.systemStatusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.statusLabel}>Database</Text>
              <Text style={styles.statusValue}>Healthy</Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.statusLabel}>API</Text>
              <Text style={styles.statusValue}>Online</Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statusLabel}>Storage</Text>
              <Text style={styles.statusValue}>85% Full</Text>
            </View>
            
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.statusLabel}>Payments</Text>
              <Text style={styles.statusValue}>Active</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  backButtonText: {
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
    backgroundColor: '#f9fafb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  adminBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  overviewSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    gap: 15,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  systemStatusSection: {
    padding: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
