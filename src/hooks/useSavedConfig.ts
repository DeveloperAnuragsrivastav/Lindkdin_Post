import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SavedConfig {
  prompt: string;
  topic: string;
}

export const useSavedConfig = () => {
  const [savedConfig, setSavedConfig] = useState<SavedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConfig = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("saved_configs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setSavedConfig(data);
    } catch (error: any) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (prompt: string, topic: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from("saved_configs")
        .upsert(
          {
            user_id: user.id,
            prompt,
            topic,
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      setSavedConfig({ prompt, topic });
      toast({
        title: "Saved Successfully",
        description: "Your prompt and topic have been saved",
      });
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConfig();

    // Set up realtime subscription
    if (!user) return;

    const channel = supabase
      .channel('saved-configs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_configs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Config change received:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setSavedConfig(payload.new as SavedConfig);
          } else if (payload.eventType === 'DELETE') {
            setSavedConfig(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { savedConfig, loading, saveConfig, refetch: fetchConfig };
};
