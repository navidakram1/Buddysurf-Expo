import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types matching Supabase schema
export interface Profile {
  id: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  birthday?: string;
  gender?: string;
  default_location?: any; // PostGIS POINT
  live_location?: any; // PostGIS POINT
  live_location_updated_at?: string;
  live_location_visible?: boolean;
  location_permission_granted?: boolean;
  onboarding_completed?: boolean;
  vibes?: string[];
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  location: any; // PostGIS POINT
  address?: string;
  start_time: string;
  end_time?: string;
  host_id: string;
  max_participants?: number;
  is_paid?: boolean;
  price?: number;
  status?: 'active' | 'cancelled' | 'completed' | 'draft';
  visibility?: 'public' | 'private' | 'friends_only';
  created_at: string;
  updated_at: string;
  // Relations
  categories?: Category;
  profiles?: Profile;
  activity_participants?: ActivityParticipant[];
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  user_id: string;
  status?: 'joined' | 'left' | 'kicked' | 'pending';
  joined_at: string;
}

export interface Conversation {
  id: string;
  type?: 'direct' | 'group' | 'activity';
  name?: string;
  activity_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  conversation_participants?: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'location' | 'system' | 'proposal';
  metadata?: any;
  created_at: string;
  updated_at: string;
  // Relations
  profiles?: Profile;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  location?: any; // PostGIS POINT
  services?: string[];
  hourly_rate?: number;
  is_verified?: boolean;
  rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
  // Relations
  profiles?: Profile;
}

export interface Gig {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  delivery_time: number;
  images?: string[];
  tags?: string[];
  status?: 'active' | 'paused' | 'draft' | 'deleted';
  created_at: string;
  updated_at: string;
  // Relations
  service_providers?: ServiceProvider;
  gig_packages?: GigPackage[];
}

export interface GigPackage {
  id: string;
  gig_id: string;
  name: string;
  description?: string;
  price: number;
  delivery_time: number;
  features?: string[];
  package_type?: 'basic' | 'standard' | 'premium';
  created_at: string;
}

export interface Booking {
  id: string;
  gig_id: string;
  package_id?: string;
  client_id: string;
  provider_id: string;
  total_amount: number;
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  requirements?: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  gigs?: Gig;
  gig_packages?: GigPackage;
  client_profile?: Profile;
  provider_profile?: Profile;
}

export interface UserLocation {
  id: string;
  user_id: string;
  location: any; // PostGIS POINT
  accuracy?: number;
  is_visible?: boolean;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: 'general' | 'activity' | 'message' | 'booking' | 'system';
  data?: any;
  is_read?: boolean;
  created_at: string;
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: string;
  created_at: string;
}
