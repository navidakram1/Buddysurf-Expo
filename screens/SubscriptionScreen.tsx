import React, { useState } from 'react';
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

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('free');

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Join up to 5 activities per month',
        'Basic chat functionality',
        'View nearby activities',
        'Create 1 activity per month',
        'Basic profile features',
      ],
    },
    {
      id: 'weekly',
      name: 'Weekly',
      price: 4.99,
      period: 'week',
      description: 'Great for active users',
      features: [
        'Unlimited activity participation',
        'Priority activity placement',
        'Advanced chat features',
        'Create unlimited activities',
        'Enhanced profile features',
        'Activity analytics',
        'Priority customer support',
      ],
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: 14.99,
      period: 'month',
      description: 'Most popular choice',
      popular: true,
      savings: 'Save 25%',
      features: [
        'Everything in Weekly',
        'Advanced filtering options',
        'Exclusive events access',
        'Custom activity categories',
        'Advanced location features',
        'Activity scheduling tools',
        'Detailed analytics dashboard',
        'Premium badges and verification',
      ],
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 199.99,
      period: 'one-time',
      description: 'Best value for long-term users',
      savings: 'Save 67%',
      features: [
        'Everything in Monthly',
        'Lifetime access to all features',
        'Early access to new features',
        'Exclusive lifetime member benefits',
        'Priority feature requests',
        'Special lifetime badge',
        'VIP customer support',
        'No recurring payments ever',
      ],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === currentPlan) {
      Alert.alert('Already Subscribed', 'You are already on this plan');
      return;
    }

    if (planId === 'free') {
      Alert.alert(
        'Downgrade Plan',
        'Are you sure you want to downgrade to the free plan? You will lose access to premium features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Downgrade', 
            style: 'destructive',
            onPress: () => {
              setCurrentPlan('free');
              Alert.alert('Success', 'You have been downgraded to the free plan');
            }
          },
        ]
      );
      return;
    }

    // In a real app, this would integrate with Stripe or another payment processor
    Alert.alert(
      'Subscribe',
      `Subscribe to ${plans.find(p => p.id === planId)?.name} plan for $${plans.find(p => p.id === planId)?.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe', 
          onPress: () => {
            setCurrentPlan(planId);
            Alert.alert('Success', 'Subscription activated! Welcome to premium features.');
          }
        },
      ]
    );
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = plan.id === currentPlan;
    const isSelected = plan.id === selectedPlan;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          plan.popular && styles.popularPlanCard,
        ]}
        onPress={() => setSelectedPlan(plan.id)}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </View>
        )}
        
        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsBadgeText}>{plan.savings}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.planPricing}>
            <Text style={styles.planPrice}>
              {plan.price === 0 ? 'Free' : `$${plan.price}`}
            </Text>
            {plan.price > 0 && (
              <Text style={styles.planPeriod}>/{plan.period}</Text>
            )}
          </View>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color="#22c55e" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            isCurrentPlan && styles.currentPlanButton,
            isSelected && !isCurrentPlan && styles.selectedSubscribeButton,
          ]}
          onPress={() => handleSubscribe(plan.id)}
          disabled={isCurrentPlan}
        >
          <Text style={[
            styles.subscribeButtonText,
            isCurrentPlan && styles.currentPlanButtonText,
            isSelected && !isCurrentPlan && styles.selectedSubscribeButtonText,
          ]}>
            {isCurrentPlan ? 'Current Plan' : 'Choose Plan'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Status */}
        <View style={styles.currentPlanSection}>
          <Text style={styles.currentPlanTitle}>Current Plan</Text>
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanName}>
                {plans.find(p => p.id === currentPlan)?.name || 'Free'}
              </Text>
              <Text style={styles.currentPlanDescription}>
                {currentPlan === 'free' 
                  ? 'You are on the free plan'
                  : `Next billing: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
                }
              </Text>
            </View>
            {currentPlan !== 'free' && (
              <TouchableOpacity style={styles.managePlanButton}>
                <Text style={styles.managePlanButtonText}>Manage</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why upgrade to Premium?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="infinite" size={24} color="#22c55e" />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Unlimited Activities</Text>
                <Text style={styles.benefitDescription}>Join and create as many activities as you want</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Priority Placement</Text>
                <Text style={styles.benefitDescription}>Your activities appear first in search results</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="analytics" size={24} color="#3b82f6" />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Advanced Analytics</Text>
                <Text style={styles.benefitDescription}>Track your activity performance and engagement</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Verified Badge</Text>
                <Text style={styles.benefitDescription}>Stand out with a premium verification badge</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>
          {plans.map(renderPlanCard)}
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, PayPal, and Apple Pay/Google Pay for mobile purchases.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is there a free trial?</Text>
            <Text style={styles.faqAnswer}>
              New users get a 7-day free trial of our Monthly plan. No credit card required to start.
            </Text>
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
  currentPlanSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  currentPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  currentPlanDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  managePlanButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  managePlanButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  benefitsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  benefitsList: {
    gap: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  plansSection: {
    padding: 20,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#22c55e',
  },
  popularPlanCard: {
    borderColor: '#3b82f6',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savingsBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
  },
  planDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  planFeatures: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedSubscribeButton: {
    backgroundColor: '#22c55e',
  },
  currentPlanButton: {
    backgroundColor: '#d1d5db',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  selectedSubscribeButtonText: {
    color: 'white',
  },
  currentPlanButtonText: {
    color: '#9ca3af',
  },
  faqSection: {
    padding: 20,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
