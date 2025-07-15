import { supabase, Activity, ActivityParticipant } from './supabase';
import { authService } from './auth';

export const activitiesService = {
  async getActivities(filters?: {
    category?: string;
    location?: { lat: number; lng: number; radius?: number };
    search?: string;
  }) {
    let query = supabase
      .from('activities')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color
        ),
        profiles:host_id (
          id,
          display_name,
          avatar_url,
          is_verified
        ),
        activity_participants (
          id,
          user_id,
          status
        )
      `)
      .eq('status', 'active')
      .eq('visibility', 'public')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate participant counts and add distance if location provided
    return data?.map(activity => ({
      ...activity,
      current_participants: activity.activity_participants?.filter(p => p.status === 'joined').length || 0,
      max_participants: activity.max_participants || 10,
    })) || [];
  },

  async getActivity(id: string) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color
        ),
        profiles:host_id (
          id,
          display_name,
          avatar_url,
          bio,
          is_verified
        ),
        activity_participants (
          id,
          user_id,
          status,
          joined_at,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createActivity(activityData: {
    title: string;
    description?: string;
    category_id: string;
    location: { lat: number; lng: number };
    address?: string;
    start_time: string;
    end_time?: string;
    max_participants?: number;
    is_paid?: boolean;
    price?: number;
    visibility?: 'public' | 'private' | 'friends_only';
  }) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const locationPoint = `POINT(${activityData.location.lng} ${activityData.location.lat})`;

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...activityData,
        host_id: user.id,
        location: locationPoint,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateActivity(id: string, updates: Partial<Activity>) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('host_id', user.id) // Only host can update
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinActivity(activityId: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Check if already joined
    const { data: existing } = await supabase
      .from('activity_participants')
      .select('id, status')
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      if (existing.status === 'joined') {
        throw new Error('Already joined this activity');
      } else {
        // Rejoin if previously left
        const { error } = await supabase
          .from('activity_participants')
          .update({ status: 'joined' })
          .eq('id', existing.id);
        
        if (error) throw error;
        return;
      }
    }

    // Check activity capacity
    const activity = await this.getActivity(activityId);
    const currentParticipants = activity.activity_participants?.filter(p => p.status === 'joined').length || 0;
    
    if (currentParticipants >= (activity.max_participants || 10)) {
      throw new Error('Activity is full');
    }

    const { error } = await supabase
      .from('activity_participants')
      .insert({
        activity_id: activityId,
        user_id: user.id,
        status: 'joined',
      });

    if (error) throw error;
  },

  async leaveActivity(activityId: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('activity_participants')
      .update({ status: 'left' })
      .eq('activity_id', activityId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getMyActivities(type: 'hosting' | 'joined' = 'joined') {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    if (type === 'hosting') {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          categories (name, icon, color),
          activity_participants (
            id,
            user_id,
            status
          )
        `)
        .eq('host_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } else {
      const { data, error } = await supabase
        .from('activity_participants')
        .select(`
          *,
          activities (
            *,
            categories (name, icon, color),
            profiles:host_id (
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'joined')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data?.map(p => p.activities) || [];
    }
  },

  async getNearbyActivities(lat: number, lng: number, radiusKm: number = 10) {
    const { data, error } = await supabase
      .rpc('get_nearby_activities', {
        user_lat: lat,
        user_lon: lng,
        radius_km: radiusKm
      });

    if (error) throw error;
    return data || [];
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },
};
