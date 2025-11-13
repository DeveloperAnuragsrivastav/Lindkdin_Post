import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Submission {
  id: string;
  prompt: string;
  topic: string;
  timestamp: string;
  status: string;
}

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from("submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubmission = async (prompt: string, topic: string, status: string = "success") => {
    if (!user) return;

    try {
      const { error } = await (supabase as any).from("submissions").insert({
        user_id: user.id,
        prompt,
        topic,
        status,
      });

      if (error) throw error;
      await fetchSubmissions();
    } catch (error: any) {
      console.error("Error adding submission:", error);
      toast({
        title: "Error",
        description: "Failed to record submission",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  return { submissions, loading, addSubmission, refetch: fetchSubmissions };
};
