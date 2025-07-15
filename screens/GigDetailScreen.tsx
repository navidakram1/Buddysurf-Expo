import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase, Gig, GigPackage, ServiceProvider } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function GigDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [packages, setPackages] = useState<GigPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GigPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      // Fetch gig details
      const { data: gigData, error: gigError } = await supabase
        .from('gigs')
        .select(`
          *,
          service_providers(
            *,
            profiles(display_name, avatar_url, username)
          )
        `)
        .eq('id', id)
        .single();

      if (gigError) throw gigError;
      setGig(gigData);

      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('gig_packages')
        .select('*')
        .eq('gig_id', id)
        .order('price', { ascending: true });

      if (packagesError) throw packagesError;
      setPackages(packagesData || []);
      
      if (packagesData && packagesData.length > 0) {
        setSelectedPackage(packagesData[0]);
      }

    } catch (error) {
      console.error('Error fetching gig details:', error);
      Alert.alert('Error', 'Failed to load gig details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!gig || !selectedPackage) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Authentication Required', 'Please sign in to book this gig');
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .insert({
          gig_id: gig.id,
          package_id: selectedPackage.id,
          client_id: user.id,
          provider_id: gig.service_providers?.user_id,
          total_amount: selectedPackage.price,
          status: 'pending'
        });

      if (error) throw error;
      
      Alert.alert('Success', 'Booking request sent! The provider will contact you soon.');
      navigation.navigate('Bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking');
    }
  };

  const renderPackageCard = (pkg: GigPackage, index: number) => (
    <TouchableOpacity
      key={pkg.id}
      style={[
        styles.packageCard,
        selectedPackage?.id === pkg.id && styles.selectedPackageCard
      ]}
      onPress={() => setSelectedPackage(pkg)}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <Text style={styles.packagePrice}>${pkg.price}</Text>
      </View>
      
      <Text style={styles.packageDescription}>{pkg.description}</Text>
      
      <View style={styles.packageDelivery}>
        <Ionicons name="time" size={14} color="#6b7280" />
        <Text style={styles.deliveryText}>{pkg.delivery_time} days delivery</Text>
      </View>
      
      {pkg.features && pkg.features.length > 0 && (
        <View style={styles.packageFeatures}>
          {pkg.features.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <Ionicons name="checkmark" size={14} color="#22c55e" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!gig) {
    return (
      <View style={styles.errorContainer}>
        <Text>Gig not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Image Gallery */}
      {gig.images && gig.images.length > 0 && (
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {gig.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.gigImage} />
            ))}
          </ScrollView>
          
          <View style={styles.imageIndicators}>
            {gig.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Gig Info */}
      <View style={styles.gigInfo}>
        <Text style={styles.gigTitle}>{gig.title}</Text>
        <Text style={styles.gigDescription}>{gig.description}</Text>
        
        {/* Provider Info */}
        <View style={styles.providerSection}>
          <View style={styles.providerHeader}>
            <View style={styles.providerAvatar}>
              {gig.service_providers?.profiles?.avatar_url ? (
                <Image 
                  source={{ uri: gig.service_providers.profiles.avatar_url }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <Ionicons name="person" size={24} color="#6b7280" />
              )}
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>
                {gig.service_providers?.name || 'Anonymous Provider'}
              </Text>
              <View style={styles.providerRating}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>
                  {gig.service_providers?.rating?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({gig.service_providers?.total_reviews || 0} reviews)
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#22c55e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags */}
        {gig.tags && gig.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {gig.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Packages */}
      <View style={styles.packagesSection}>
        <Text style={styles.sectionTitle}>Choose a Package</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.packagesContainer}>
            {packages.map(renderPackageCard)}
          </View>
        </ScrollView>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What's included in the service?</Text>
          <Text style={styles.faqAnswer}>
            All details are specified in the package description above.
          </Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How long does delivery take?</Text>
          <Text style={styles.faqAnswer}>
            Delivery time varies by package, typically {selectedPackage?.delivery_time || gig.delivery_time} days.
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Starting at</Text>
          <Text style={styles.price}>${selectedPackage?.price || gig.base_price}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  imageGallery: {
    height: 250,
    marginTop: 60,
  },
  gigImage: {
    width: width,
    height: 250,
    backgroundColor: '#f3f4f6',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  gigInfo: {
    padding: 20,
  },
  gigTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  gigDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  providerSection: {
    marginBottom: 20,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewCount: {
    fontSize: 14,
    color: '#9ca3af',
  },
  contactButton: {
    padding: 8,
  },
  tagsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: '#22c55e',
  },
  packagesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  packagesContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  packageCard: {
    width: 250,
    backgroundColor: '#f9fafb',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackageCard: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  packageDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 20,
  },
  packageDelivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  deliveryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  packageFeatures: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#4b5563',
  },
  faqSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 15,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  priceInfo: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  bookButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  bookButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
