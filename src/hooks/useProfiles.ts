import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
      logger.debug('Profiles fetched successfully', { count: data?.length || 0 });
    } catch (error: any) {
      logger.error("Error fetching profiles", { userId: user?.id }, error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!user) return;

    try {
      // Delete the auth user (this will cascade to profile via trigger)
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;

      logger.info('Profile deleted successfully', { deletedId: id, userId: user.id });

      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting user", { userId: user?.id, targetId: id }, error);
      toast({
        title: "Error",
        description: "Failed to delete user. You may not have permission.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfiles();

    // Set up realtime subscription
    if (!user) return;

    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change received:', payload);
          fetchProfiles(); // Refetch to keep consistent state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { 
    profiles, 
    loading, 
    deleteProfile,
    refetch: fetchProfiles 
  };
};
