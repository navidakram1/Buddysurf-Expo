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
import { supabase, Gig, ServiceProvider } from '../lib/supabase';

export default function GigsScreen() {
  const navigation = useNavigation();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'delivery'>('rating');

  const categories = [
    'Design & Creative',
    'Programming & Tech',
    'Digital Marketing',
    'Writing & Translation',
    'Video & Animation',
    'Music & Audio',
    'Business',
    'Lifestyle',
  ];

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          service_providers(
            name,
            rating,
            total_reviews,
            profiles(avatar_url)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGigs(data || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      Alert.alert('Error', 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || gig.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderGigCard = ({ item }: { item: Gig }) => (
    <TouchableOpacity
      style={styles.gigCard}
      onPress={() => navigation.navigate('GigDetail', { id: item.id })}
    >
      {item.images && item.images.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.gigImage} />
      )}
      
      <View style={styles.gigContent}>
        <Text style={styles.gigTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gigDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.providerInfo}>
          <View style={styles.providerAvatar}>
            {item.service_providers?.profiles?.avatar_url ? (
              <Image 
                source={{ uri: item.service_providers.profiles.avatar_url }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Ionicons name="person" size={16} color="#6b7280" />
            )}
          </View>
          <Text style={styles.providerName}>
            {item.service_providers?.name || 'Anonymous'}
          </Text>
          
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {item.service_providers?.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.reviewCount}>
              ({item.service_providers?.total_reviews || 0})
            </Text>
          </View>
        </View>
        
        <View style={styles.gigFooter}>
          <View style={styles.deliveryTime}>
            <Ionicons name="time" size={14} color="#6b7280" />
            <Text style={styles.deliveryText}>{item.delivery_time} days</Text>
          </View>
          
          <Text style={styles.gigPrice}>From ${item.base_price}</Text>
        </View>
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory === category && styles.selectedCategoryTabText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gigs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('ProviderDashboard')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search gigs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categories.map(renderCategoryTab)}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {[
          { key: 'rating', label: 'Rating' },
          { key: 'price', label: 'Price' },
          { key: 'delivery', label: 'Delivery Time' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortOption, sortBy === option.key && styles.selectedSortOption]}
            onPress={() => setSortBy(option.key as any)}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === option.key && styles.selectedSortOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gigs List */}
      <FlatList
        data={filteredGigs}
        renderItem={renderGigCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gigsList}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchGigs}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
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
  filterButton: {
    padding: 8,
  },
  categoryTabs: {
    maxHeight: 50,
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  sortLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
  },
  selectedSortOption: {
    backgroundColor: '#22c55e',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedSortOptionText: {
    color: 'white',
  },
  gigsList: {
    padding: 20,
  },
  gigCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 5,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    overflow: 'hidden',
  },
  gigImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
  },
  gigContent: {
    padding: 12,
  },
  gigTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 18,
  },
  gigDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  providerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  providerName: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#6b7280',
  },
  reviewCount: {
    fontSize: 10,
    color: '#9ca3af',
  },
  gigFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 11,
    color: '#6b7280',
  },
  gigPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#22c55e',
  },
});
