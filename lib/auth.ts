import { supabase } from './supabase';

export const authService = {
  async signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          display_name: displayName,
        });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId?: string) {
    const user = userId || (await this.getCurrentUser())?.id;
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(updates: Partial<any>) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLocation(latitude: number, longitude: number, isLive: boolean = false) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const locationPoint = `POINT(${longitude} ${latitude})`;

    if (isLive) {
      // Update live location
      const { error } = await supabase
        .from('profiles')
        .update({
          live_location: locationPoint,
          live_location_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Also update user_locations table for real-time tracking
      const { error: locationError } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          location: locationPoint,
          updated_at: new Date().toISOString(),
        });

      if (locationError) throw locationError;
    } else {
      // Update default location
      const { error } = await supabase
        .from('profiles')
        .update({
          default_location: locationPoint,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    }
  },

  async completeOnboarding(profileData: any) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
