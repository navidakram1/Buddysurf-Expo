import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function HelpScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqCategories = [
    { id: 'all', name: 'All' },
    { id: 'account', name: 'Account' },
    { id: 'activities', name: 'Activities' },
    { id: 'payments', name: 'Payments' },
    { id: 'safety', name: 'Safety' },
    { id: 'technical', name: 'Technical' },
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create an account?',
      answer: 'To create an account, tap the "Sign Up" button on the login screen and follow the prompts to enter your email, create a password, and complete your profile.',
      category: 'account',
    },
    {
      id: '2',
      question: 'How do I join an activity?',
      answer: 'Browse activities on the Activities tab, tap on one you\'re interested in, and click "Join Activity". Some activities may require approval from the host.',
      category: 'activities',
    },
    {
      id: '3',
      question: 'How do I create my own activity?',
      answer: 'Go to the Activities tab, tap the "+" button, fill in the activity details including title, description, location, and time, then publish it.',
      category: 'activities',
    },
    {
      id: '4',
      question: 'How do payments work?',
      answer: 'Payments are processed securely through our platform. For paid activities, payment is required when joining. For services, payment is held in escrow until completion.',
      category: 'payments',
    },
    {
      id: '5',
      question: 'What if I need to cancel an activity?',
      answer: 'You can cancel activities you\'ve created from your profile. Participants will be notified automatically. Refund policies depend on the cancellation timing.',
      category: 'activities',
    },
    {
      id: '6',
      question: 'How do I report inappropriate behavior?',
      answer: 'Use the report button on any profile, activity, or message. Our moderation team reviews all reports within 24 hours.',
      category: 'safety',
    },
    {
      id: '7',
      question: 'Why can\'t I see my location on the map?',
      answer: 'Make sure you\'ve granted location permissions to the app in your device settings. You can also manually set your location in your profile.',
      category: 'technical',
    },
    {
      id: '8',
      question: 'How do I become a service provider?',
      answer: 'Go to the Hire tab and tap "Become a Provider". Complete your provider profile with your skills, experience, and pricing.',
      category: 'account',
    },
    {
      id: '9',
      question: 'What are the fees for using the platform?',
      answer: 'Basic features are free. Premium subscriptions start at $4.99/week. Service providers pay a 5% commission on completed bookings.',
      category: 'payments',
    },
    {
      id: '10',
      question: 'How do I delete my account?',
      answer: 'Go to Settings > Account > Delete Account. Note that this action is permanent and cannot be undone.',
      category: 'account',
    },
  ];

  const contactOptions: ContactOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help via email (24-48 hour response)',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@buddysurf.com'),
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team (9 AM - 6 PM)',
      icon: 'chatbubble',
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!'),
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      icon: 'call',
      action: () => Linking.openURL('tel:+1-555-BUDDY-SF'),
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Ask questions and get help from other users',
      icon: 'people',
      action: () => Linking.openURL('https://community.buddysurf.com'),
    },
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const renderFAQItem = (item: FAQItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.faqItem}
      onPress={() => toggleFAQ(item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons 
          name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#6b7280" 
        />
      </View>
      {expandedFAQ === item.id && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const renderContactOption = (option: ContactOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.contactOption}
      onPress={option.action}
    >
      <View style={styles.contactIcon}>
        <Ionicons name={option.icon as any} size={24} color="#22c55e" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactDescription}>{option.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Help */}
        <View style={styles.quickHelpSection}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <View style={styles.quickHelpGrid}>
            <TouchableOpacity style={styles.quickHelpItem}>
              <Ionicons name="person-add" size={24} color="#22c55e" />
              <Text style={styles.quickHelpText}>Getting Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickHelpItem}>
              <Ionicons name="calendar" size={24} color="#3b82f6" />
              <Text style={styles.quickHelpText}>Creating Activities</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickHelpItem}>
              <Ionicons name="card" size={24} color="#f59e0b" />
              <Text style={styles.quickHelpText}>Payments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickHelpItem}>
              <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
              <Text style={styles.quickHelpText}>Safety Tips</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {contactOptions.map(renderContactOption)}
        </View>

        {/* FAQ Categories */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {faqCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.selectedCategoryTab
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === category.id && styles.selectedCategoryTabText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ Items */}
          <View style={styles.faqList}>
            {filteredFAQs.map(renderFAQItem)}
            
            {filteredFAQs.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="help-circle-outline" size={48} color="#d1d5db" />
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsText}>
                  Try adjusting your search terms or browse different categories
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="document-text" size={20} color="#6b7280" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>User Guide</Text>
              <Text style={styles.resourceDescription}>Complete guide to using BuddySurf</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#d1d5db" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="shield-checkmark" size={20} color="#6b7280" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Safety Guidelines</Text>
              <Text style={styles.resourceDescription}>Stay safe while using our platform</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#d1d5db" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="document" size={20} color="#6b7280" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Terms of Service</Text>
              <Text style={styles.resourceDescription}>Platform terms and conditions</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#d1d5db" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="lock-closed" size={20} color="#6b7280" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Privacy Policy</Text>
              <Text style={styles.resourceDescription}>How we protect your data</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* System Status */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.statusText}>All systems operational</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.statusLink}>View Status Page</Text>
            </TouchableOpacity>
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
  searchSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  quickHelpSection: {
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
  quickHelpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickHelpItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 15,
    gap: 10,
  },
  quickHelpText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  contactSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactOption: {
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
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  faqSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 20,
  },
  categoriesContent: {
    gap: 10,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  selectedCategoryTab: {
    backgroundColor: '#22c55e',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedCategoryTabText: {
    color: 'white',
  },
  faqList: {
    gap: 10,
  },
  faqItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  resourcesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 15,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusSection: {
    padding: 20,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  statusLink: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
});
