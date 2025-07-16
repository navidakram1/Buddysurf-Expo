import { supabase, Gig, ServiceProvider, Booking, GigPackage } from './supabase';
import { authService } from './auth';

export const gigsService = {
  async getGigs(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: { lat: number; lng: number; radius?: number };
  }) {
    let query = supabase
      .from('gigs')
      .select(`
        *,
        service_providers (
          *,
          profiles (
            display_name,
            avatar_url,
            is_verified
          )
        ),
        gig_packages (
          id,
          name,
          price,
          delivery_time,
          package_type
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
    }

    if (filters?.minPrice) {
      query = query.gte('base_price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('base_price', filters.maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getGig(id: string) {
    const { data, error } = await supabase
      .from('gigs')
      .select(`
        *,
        service_providers (
          *,
          profiles (
            id,
            display_name,
            avatar_url,
            bio,
            is_verified
          )
        ),
        gig_packages (
          *
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createGig(gigData: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    base_price: number;
    delivery_time: number;
    images?: string[];
    tags?: string[];
    packages?: Omit<GigPackage, 'id' | 'gig_id' | 'created_at'>[];
  }) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Get or create service provider profile
    let { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!provider) {
      const profile = await authService.getProfile();
      const { data: newProvider, error: providerError } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          name: profile?.display_name || 'Service Provider',
          bio: profile?.bio,
        })
        .select('id')
        .single();

      if (providerError) throw providerError;
      provider = newProvider;
    }

    const { packages, ...gigInfo } = gigData;

    // Create gig
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        ...gigInfo,
        provider_id: provider.id,
        status: 'active',
      })
      .select()
      .single();

    if (gigError) throw gigError;

    // Create packages if provided
    if (packages && packages.length > 0) {
      const { error: packagesError } = await supabase
        .from('gig_packages')
        .insert(
          packages.map(pkg => ({
            ...pkg,
            gig_id: gig.id,
          }))
        );

      if (packagesError) throw packagesError;
    }

    return gig;
  },

  async updateGig(id: string, updates: Partial<Gig>) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Verify ownership
    const { data: gig } = await supabase
      .from('gigs')
      .select(`
        id,
        service_providers!inner (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (!gig || gig.service_providers.user_id !== user.id) {
      throw new Error('Not authorized to update this gig');
    }

    const { data, error } = await supabase
      .from('gigs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createBooking(bookingData: {
    gig_id: string;
    package_id?: string;
    requirements?: string;
    delivery_date?: string;
  }) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Get gig and package details to calculate total
    const gig = await this.getGig(bookingData.gig_id);
    let totalAmount = gig.base_price;

    if (bookingData.package_id) {
      const selectedPackage = gig.gig_packages?.find(p => p.id === bookingData.package_id);
      if (selectedPackage) {
        totalAmount = selectedPackage.price;
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        client_id: user.id,
        provider_id: gig.service_providers.id,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyBookings(type: 'client' | 'provider' = 'client') {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const column = type === 'client' ? 'client_id' : 'provider_id';

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        gigs (
          title,
          category,
          images
        ),
        gig_packages (
          name,
          features
        ),
        client_profile:client_id (
          display_name,
          avatar_url
        ),
        provider_profile:provider_id (
          name,
          profiles (
            display_name,
            avatar_url
          )
        )
      `)
      .eq(column, user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateBookingStatus(bookingId: string, status: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getServiceProvider(userId?: string) {
    const targetUserId = userId || (await authService.getCurrentUser())?.id;
    if (!targetUserId) throw new Error('User not found');

    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url,
          bio,
          is_verified
        )
      `)
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateServiceProvider(updates: Partial<ServiceProvider>) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('service_providers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMyGigs() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const provider = await this.getServiceProvider();
    if (!provider) return [];

    const { data, error } = await supabase
      .from('gigs')
      .select(`
        *,
        gig_packages (
          id,
          name,
          price,
          package_type
        )
      `)
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getGigCategories() {
    // Return predefined categories for now
    return [
      { id: 'tutoring', name: 'Tutoring', icon: 'school' },
      { id: 'fitness', name: 'Fitness', icon: 'fitness' },
      { id: 'tech', name: 'Tech', icon: 'laptop' },
      { id: 'creative', name: 'Creative', icon: 'brush' },
      { id: 'home', name: 'Home', icon: 'home' },
      { id: 'business', name: 'Business', icon: 'briefcase' },
      { id: 'lifestyle', name: 'Lifestyle', icon: 'heart' },
    ];
  },
};
