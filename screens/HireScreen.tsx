import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { gigsService } from '../lib/gigs';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  provider: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  images: string[];
}

const serviceCategories = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'tutoring', name: 'Tutoring', icon: 'school' },
  { id: 'fitness', name: 'Fitness', icon: 'fitness' },
  { id: 'tech', name: 'Tech', icon: 'laptop' },
  { id: 'creative', name: 'Creative', icon: 'brush' },
  { id: 'home', name: 'Home', icon: 'home' },
];

export default function HireScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory, searchQuery]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const gigs = await gigsService.getGigs();

      // Transform gigs to services format
      const transformedServices: Service[] = gigs.map(gig => ({
        id: gig.id,
        title: gig.title,
        description: gig.description,
        category: gig.category,
        price: gig.base_price,
        rating: gig.service_providers?.rating || 0,
        reviewCount: gig.service_providers?.total_reviews || 0,
        provider: {
          id: gig.service_providers?.id || '',
          name: gig.service_providers?.name || 'Unknown Provider',
          verified: gig.service_providers?.is_verified || false,
        },
        images: gig.images || [],
      }));

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#f59e0b" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#f59e0b" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#d1d5db" />
      );
    }

    return stars;
  };

  const renderServiceCard = (service: Service) => (
    <TouchableOpacity key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceImageContainer}>
        {service.images.length > 0 ? (
          <Image source={{ uri: service.images[0] }} style={styles.serviceImage} />
        ) : (
          <View style={styles.serviceImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#9ca3af" />
          </View>
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${service.price}/hr</Text>
        </View>
      </View>

      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service.description}
        </Text>

        <View style={styles.providerInfo}>
          <View style={styles.providerAvatar}>
            {service.provider.avatar ? (
              <Image source={{ uri: service.provider.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={20} color="#6b7280" />
            )}
          </View>
          <View style={styles.providerDetails}>
            <View style={styles.providerNameContainer}>
              <Text style={styles.providerName}>{service.provider.name}</Text>
              {service.provider.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              )}
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {renderStars(service.rating)}
              </View>
              <Text style={styles.ratingText}>
                {service.rating} ({service.reviewCount})
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hire Services</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
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
        {serviceCategories.map((category) => (
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

      {/* Services List */}
      <ScrollView style={styles.servicesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading services...</Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <View style={styles.servicesGrid}>
            {filteredServices.map(renderServiceCard)}
          </View>
        )}
      </ScrollView>
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
  filterButton: {
    padding: 4,
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
  servicesList: {
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
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceImageContainer: {
    position: 'relative',
    height: 120,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceContent: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  providerDetails: {
    flex: 1,
  },
  providerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginRight: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
