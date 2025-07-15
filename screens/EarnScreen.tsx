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

interface EarningStats {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayouts: number;
  completedGigs: number;
  averageRating: number;
}

interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  icon: string;
  potentialEarning: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export default function EarnScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<EarningStats>({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    pendingPayouts: 0,
    completedGigs: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  const earningOpportunities: EarningOpportunity[] = [
    {
      id: '1',
      title: 'Become a Service Provider',
      description: 'Offer your skills and services to the community',
      icon: 'briefcase',
      potentialEarning: '$500-2000/month',
      difficulty: 'Medium',
      category: 'Services',
    },
    {
      id: '2',
      title: 'Host Premium Activities',
      description: 'Create paid activities and events',
      icon: 'calendar',
      potentialEarning: '$50-200/event',
      difficulty: 'Easy',
      category: 'Activities',
    },
    {
      id: '3',
      title: 'Referral Program',
      description: 'Earn by inviting friends to join BuddySurf',
      icon: 'people',
      potentialEarning: '$10/referral',
      difficulty: 'Easy',
      category: 'Referrals',
    },
    {
      id: '4',
      title: 'Content Creation',
      description: 'Create guides and tutorials for activities',
      icon: 'create',
      potentialEarning: '$25-100/guide',
      difficulty: 'Medium',
      category: 'Content',
    },
    {
      id: '5',
      title: 'Community Moderation',
      description: 'Help moderate community activities and content',
      icon: 'shield-checkmark',
      potentialEarning: '$300-800/month',
      difficulty: 'Hard',
      category: 'Moderation',
    },
    {
      id: '6',
      title: 'Photography Services',
      description: 'Offer photography for events and activities',
      icon: 'camera',
      potentialEarning: '$100-500/event',
      difficulty: 'Medium',
      category: 'Services',
    },
  ];

  useEffect(() => {
    fetchEarningStats();
  }, []);

  const fetchEarningStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch provider data
      const { data: providerData } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerData) {
        // Fetch bookings for earnings calculation
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('provider_id', providerData.id);

        if (bookingsData) {
          const completedBookings = bookingsData.filter(b => b.status === 'completed');
          const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
          
          const thisMonth = completedBookings
            .filter(b => new Date(b.created_at).getMonth() === new Date().getMonth())
            .reduce((sum, booking) => sum + booking.total_amount, 0);
          
          const lastMonth = completedBookings
            .filter(b => new Date(b.created_at).getMonth() === new Date().getMonth() - 1)
            .reduce((sum, booking) => sum + booking.total_amount, 0);
          
          const pendingPayouts = bookingsData
            .filter(b => ['accepted', 'in_progress'].includes(b.status || ''))
            .reduce((sum, booking) => sum + booking.total_amount, 0);

          setStats({
            totalEarnings,
            thisMonth,
            lastMonth,
            pendingPayouts,
            completedGigs: completedBookings.length,
            averageRating: providerData.rating || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching earning stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunityPress = (opportunity: EarningOpportunity) => {
    switch (opportunity.category) {
      case 'Services':
        navigation.navigate('ProviderDashboard');
        break;
      case 'Activities':
        navigation.navigate('Activity');
        break;
      case 'Referrals':
        Alert.alert('Referral Program', 'Share your referral code: BUDDY' + Math.random().toString(36).substr(2, 6).toUpperCase());
        break;
      default:
        Alert.alert('Coming Soon', 'This earning opportunity will be available soon!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderOpportunityCard = (opportunity: EarningOpportunity) => (
    <TouchableOpacity
      key={opportunity.id}
      style={styles.opportunityCard}
      onPress={() => handleOpportunityPress(opportunity)}
    >
      <View style={styles.opportunityHeader}>
        <View style={styles.opportunityIcon}>
          <Ionicons name={opportunity.icon as any} size={24} color="#22c55e" />
        </View>
        <View style={styles.opportunityInfo}>
          <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
          <Text style={styles.opportunityDescription}>{opportunity.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      </View>
      
      <View style={styles.opportunityFooter}>
        <View style={styles.earningPotential}>
          <Text style={styles.earningLabel}>Potential:</Text>
          <Text style={styles.earningAmount}>{opportunity.potentialEarning}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(opportunity.difficulty) }]}>
          <Text style={styles.difficultyText}>{opportunity.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earn Money</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Ionicons name="wallet" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Earnings Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Your Earnings</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${stats.totalEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${stats.thisMonth.toFixed(2)}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>${stats.pendingPayouts.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completedGigs}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          {stats.totalEarnings > 0 && (
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>Performance</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>{stats.averageRating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.performanceDescription}>
                {stats.thisMonth > stats.lastMonth 
                  ? `📈 Great job! You earned ${((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(0)}% more this month.`
                  : '💡 Consider exploring new earning opportunities to boost your income.'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('ProviderDashboard')}
            >
              <Ionicons name="briefcase" size={24} color="#22c55e" />
              <Text style={styles.quickActionText}>Create Gig</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Activity')}
            >
              <Ionicons name="calendar" size={24} color="#3b82f6" />
              <Text style={styles.quickActionText}>Host Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Ionicons name="card" size={24} color="#8b5cf6" />
              <Text style={styles.quickActionText}>Withdraw</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="analytics" size={24} color="#f59e0b" />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earning Opportunities */}
        <View style={styles.opportunitiesSection}>
          <Text style={styles.sectionTitle}>Earning Opportunities</Text>
          <Text style={styles.sectionDescription}>
            Discover different ways to earn money on BuddySurf
          </Text>
          
          {earningOpportunities.map(renderOpportunityCard)}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Earning Tips</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>Complete your profile</Text>
              <Text style={styles.tipDescription}>
                A complete profile with photos and reviews builds trust and attracts more clients.
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>Respond quickly</Text>
              <Text style={styles.tipDescription}>
                Fast response times lead to higher booking rates and better reviews.
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>Offer competitive pricing</Text>
              <Text style={styles.tipDescription}>
                Research similar services and price competitively to attract more bookings.
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>Deliver quality work</Text>
              <Text style={styles.tipDescription}>
                High-quality service leads to positive reviews and repeat customers.
              </Text>
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
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
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
    color: '#22c55e',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  performanceDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
    padding: 20,
    borderRadius: 15,
    gap: 10,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  opportunitiesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  opportunityCard: {
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
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  opportunityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opportunityInfo: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  opportunityDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  opportunityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningPotential: {
    flex: 1,
  },
  earningLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  earningAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  tipsSection: {
    padding: 20,
  },
  tipsList: {
    gap: 15,
  },
  tipItem: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  tipDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});
