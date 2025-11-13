import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWebhooks = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWebhooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("webhooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
      logger.debug('Webhooks fetched successfully', { count: data?.length || 0, userId: user.id });
    } catch (error: any) {
      logger.error("Error fetching webhooks", { userId: user?.id }, error);
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async (name: string, url: string, events: string[]) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any).from("webhooks").insert({
        user_id: user.id,
        name,
        url,
        events,
        is_active: true,
      });

      if (error) throw error;

      logger.info('Webhook created successfully', {
        userId: user.id,
        webhookName: name,
        eventsCount: events.length,
      });

      toast({
        title: "Webhook Created",
        description: "Your webhook has been created successfully",
      });
    } catch (error: any) {
      logger.error("Error creating webhook", { userId: user?.id, webhookName: name }, error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    }
  };

  const updateWebhook = async (id: string, updates: Partial<Webhook>) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from("webhooks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Webhook Updated",
        description: "Your webhook has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from("webhooks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Webhook Deleted",
        description: "Your webhook has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting webhook:", error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWebhooks();

    // Set up realtime subscription
    if (!user) return;

    const channel = supabase
      .channel('webhooks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhooks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Webhook change received:', payload);
          fetchWebhooks(); // Refetch to keep consistent state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { 
    webhooks, 
    loading, 
    createWebhook, 
    updateWebhook, 
    deleteWebhook,
    refetch: fetchWebhooks 
  };
};
