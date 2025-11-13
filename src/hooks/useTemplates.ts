import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Template {
  id: string;
  name: string;
  text: string;
  is_default: boolean;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("prompt_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, name: string, text: string) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from("prompt_templates")
        .update({ name, text })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Template Updated",
        description: "Your template has been saved successfully",
      });
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTemplates();

    // Set up realtime subscription
    if (!user) return;

    const channel = supabase
      .channel('templates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prompt_templates',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Template change received:', payload);
          fetchTemplates(); // Refetch to keep order consistent
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { templates, loading, updateTemplate, refetch: fetchTemplates };
};
