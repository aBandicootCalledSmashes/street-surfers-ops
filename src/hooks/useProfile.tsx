import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  profile_photo_url: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  plate_number: string | null;
  is_online: boolean;
  dispatcher_name: string | null;
  dispatcher_phone: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return { error: new Error('No profile found') };

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Profile updated',
        duration: 2000,
      });

      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Failed to update profile',
        variant: 'destructive',
      });
      return { error: err };
    }
  }, [profile, toast]);

  // Toggle online status
  const toggleOnlineStatus = useCallback(async (isOnline: boolean) => {
    return updateProfile({ is_online: isOnline });
  }, [updateProfile]);

  // Update phone number
  const updatePhone = useCallback(async (phone: string) => {
    return updateProfile({ phone });
  }, [updateProfile]);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        duration: 2000,
      });

      return { error: null };
    } catch (err) {
      console.error('Error updating password:', err);
      toast({
        title: 'Failed to update password',
        variant: 'destructive',
      });
      return { error: err };
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    toggleOnlineStatus,
    updatePhone,
    updatePassword,
  };
}
