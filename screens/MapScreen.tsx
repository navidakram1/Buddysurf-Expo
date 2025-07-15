import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface UserLocation {
  id: string;
  latitude: number;
  longitude: number;
  display_name: string;
  avatar_url?: string;
}

interface ActivityMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  category: string;
  participants: number;
  maxParticipants: number;
}

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [activities, setActivities] = useState<ActivityMarker[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showUsers, setShowUsers] = useState(true);
  const [showActivities, setShowActivities] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    fetchNearbyUsers();
    fetchNearbyActivities();
    setupRealtimeSubscriptions();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your location on the map');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(currentLocation);
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('is_visible', true)
        .not('location', 'is', null);

      if (error) throw error;

      const userLocations: UserLocation[] = data
        .filter(userLoc => userLoc.location && userLoc.profiles)
        .map(userLoc => {
          // Parse PostGIS POINT format: "POINT(lng lat)"
          const coords = userLoc.location.replace('POINT(', '').replace(')', '').split(' ');
          return {
            id: userLoc.user_id,
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[0]),
            display_name: userLoc.profiles.display_name || 'User',
            avatar_url: userLoc.profiles.avatar_url,
          };
        });

      setUsers(userLocations);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchNearbyActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          title,
          location,
          max_participants,
          categories (
            name,
            color
          ),
          activity_participants!inner (
            status
          )
        `)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .not('location', 'is', null);

      if (error) throw error;

      const activityMarkers: ActivityMarker[] = data
        .filter(activity => activity.location)
        .map(activity => {
          // Parse PostGIS POINT format: "POINT(lng lat)"
          const coords = activity.location.replace('POINT(', '').replace(')', '').split(' ');
          const participants = activity.activity_participants?.filter(p => p.status === 'joined').length || 0;

          return {
            id: activity.id,
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[0]),
            title: activity.title,
            category: activity.categories?.name || 'activity',
            participants,
            maxParticipants: activity.max_participants || 10,
          };
        });

      setActivities(activityMarkers);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const userLocationsSubscription = supabase
      .channel('user_locations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_locations'
      }, () => {
        fetchNearbyUsers();
      })
      .subscribe();

    const activitiesSubscription = supabase
      .channel('activities_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, () => {
        fetchNearbyActivities();
      })
      .subscribe();

    return () => {
      userLocationsSubscription.unsubscribe();
      activitiesSubscription.unsubscribe();
    };
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      sports: '#ef4444',
      social: '#3b82f6',
      food: '#f59e0b',
      outdoor: '#10b981',
      learning: '#8b5cf6',
      default: '#6b7280',
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        provider={PROVIDER_DEFAULT}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        onRegionChangeComplete={setRegion}
      >
        {/* User Markers */}
        {showUsers && users.map((user) => (
          <Marker
            key={`user-${user.id}`}
            coordinate={{
              latitude: user.latitude,
              longitude: user.longitude,
            }}
            title={user.display_name}
            description="BuddySurf User"
            pinColor="#22c55e"
          />
        ))}

        {/* Activity Markers */}
        {showActivities && activities.map((activity) => (
          <Marker
            key={`activity-${activity.id}`}
            coordinate={{
              latitude: activity.latitude,
              longitude: activity.longitude,
            }}
            title={activity.title}
            description={`${activity.participants}/${activity.maxParticipants} participants`}
            pinColor={getCategoryColor(activity.category)}
          />
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={getCurrentLocation}>
          <Ionicons name="locate" size={24} color="#22c55e" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Ionicons name="layers" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      {/* Filter Controls */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, showUsers && styles.filterButtonActive]}
          onPress={() => setShowUsers(!showUsers)}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={showUsers ? 'white' : '#22c55e'} 
          />
          <Text style={[styles.filterText, showUsers && styles.filterTextActive]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, showActivities && styles.filterButtonActive]}
          onPress={() => setShowActivities(!showActivities)}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={showActivities ? 'white' : '#22c55e'} 
          />
          <Text style={[styles.filterText, showActivities && styles.filterTextActive]}>
            Activities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {users.length} users • {activities.length} activities nearby
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 60,
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  filters: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22c55e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#22c55e',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
  filterTextActive: {
    color: 'white',
  },
  statsBar: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statsText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});
