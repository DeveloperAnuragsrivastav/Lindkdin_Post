import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Send, Save, Play, Pause, Sparkles, Zap, ArrowRight, TrendingUp, Activity } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import promptAudio from "@/assets/prompt-templates-audio.mp3";
import configAudio from "@/assets/configuration-audio.mp3";
import { useTemplates } from "@/hooks/useTemplates";
import { useSavedConfig } from "@/hooks/useSavedConfig";
import { useSubmissions } from "@/hooks/useSubmissions";
const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConfigPlaying, setIsConfigPlaying] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editedTemplateName, setEditedTemplateName] = useState("");
  const [editedTemplateText, setEditedTemplateText] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const configAudioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  const { templates, loading: templatesLoading, updateTemplate } = useTemplates();
  const { savedConfig, loading: configLoading, saveConfig } = useSavedConfig();
  const { addSubmission } = useSubmissions();
  
  const WEBHOOK_URL = "https://n8n.gignaati.com/webhook/07e74f76-8ca8-4b43-87f9-0d95a0ee8bae";
  useEffect(() => {
    if (savedConfig && !configLoading) {
      setPrompt(savedConfig.prompt);
      setTopic(savedConfig.topic);
      setIsEditing(false);
    }
  }, [savedConfig, configLoading]);
  const handleSave = async () => {
    if (!prompt.trim() || !topic.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both fields",
        variant: "destructive"
      });
      return;
    }
    await saveConfig(prompt, topic);
    setIsEditing(false);
  };
  const handleSubmit = async () => {
    if (!prompt.trim() || !topic.trim()) {
      toast({
        title: "Error",
        description: "Please save your prompt and topic first",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          topic: topic,
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        await addSubmission(prompt, topic, "success");
        toast({
          title: "Success",
          description: "Data sent to webhook successfully"
        });
      } else {
        await addSubmission(prompt, topic, "failed");
        throw new Error("Failed to send data");
      }
    } catch (error) {
      console.error("Error sending to webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send data to webhook. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
  };
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const toggleConfigAudio = () => {
    if (configAudioRef.current) {
      if (isConfigPlaying) {
        configAudioRef.current.pause();
      } else {
        configAudioRef.current.play();
      }
      setIsConfigPlaying(!isConfigPlaying);
    }
  };
  const handleEditTemplate = (templateId: string, name: string, text: string) => {
    setEditingTemplateId(templateId);
    setEditedTemplateName(name);
    setEditedTemplateText(text);
  };

  const handleSaveTemplate = async () => {
    if (!editedTemplateName.trim() || !editedTemplateText.trim()) {
      toast({
        title: "Error",
        description: "Template name and text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplateId) {
      await updateTemplate(editingTemplateId, editedTemplateName, editedTemplateText);
      setEditingTemplateId(null);
    }
  };
  const handleInsertTemplate = (templateText: string) => {
    setPrompt(templateText);
    setIsEditing(true);
    toast({
      title: "Template Inserted",
      description: "You can now edit and save your configuration"
    });
  };
  return <SidebarProvider>
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
          <SidebarTrigger className="hover:bg-accent/50" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Linkdin
 Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your LinkedIn content generation</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          

          <div className="max-w-7xl mx-auto space-y-6">
            {/* Prompt Templates Section */}
            <Card className="border-border/50 animate-fade-in">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Prompt Templates</CardTitle>
                      <CardDescription>
                        Choose from professionally crafted templates
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={toggleAudio} aria-label={isPlaying ? "Pause audio" : "Play audio"} className="hover:bg-primary/10 hover:text-primary transition-all">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                <audio ref={audioRef} src={promptAudio} onEnded={() => setIsPlaying(false)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />
              </CardHeader>
              <CardContent className="p-6">
                {templatesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {templates.map((template, index) => (
                      <Card key={template.id} className="group border-border/50 hover:border-primary/50 transition-all duration-300 animate-fade-in" style={{
                        animationDelay: `${index * 0.1}s`
                      }}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            {template.name} Template
                          </CardTitle>
                          <CardDescription className="text-xs">Prompt Example - Learn How It Works</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-muted/50 p-3 rounded-lg max-h-32 overflow-y-auto border border-border/50">
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-5 leading-relaxed">
                              {template.text}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleInsertTemplate(template.text)} className="flex-1 gap-2 transition-all" size="sm">
                              Insert Template
                              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button onClick={() => handleEditTemplate(template.id, template.name, template.text)} variant="outline" size="sm" className="gap-2" disabled={template.is_default}>
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration Section */}
            <Card className="border-border/50 animate-fade-in" style={{
              animationDelay: "0.2s"
            }}>
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Configuration</CardTitle>
                      <CardDescription>
                        {isEditing ? "Set up your content preferences" : "Your configuration is ready"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={toggleConfigAudio} aria-label={isConfigPlaying ? "Pause audio" : "Play audio"} className="hover:bg-primary/10 hover:text-primary transition-all">
                      {isConfigPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    {!isEditing && <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>}
                  </div>
                </div>
                <audio ref={configAudioRef} src={configAudio} onEnded={() => setIsConfigPlaying(false)} onPause={() => setIsConfigPlaying(false)} onPlay={() => setIsConfigPlaying(true)} />
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {configLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading configuration...</div>
                ) : isEditing ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm font-medium">Today's Topic</Label>
                      <Input id="topic" placeholder="e.g., AI in Digital Transformation..." value={topic} onChange={e => setTopic(e.target.value)} className="h-10 border-border/50 focus:border-primary/50 transition-colors" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prompt" className="text-sm font-medium">Your Prompt</Label>
                      <Textarea id="prompt" placeholder="Paste your template or write a custom prompt..." value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[140px] border-border/50 focus:border-primary/50 transition-colors resize-none" />
                    </div>

                    <Button onClick={handleSave} className="w-full gap-2 transition-all" size="default">
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topic</Label>
                        <p className="text-base font-semibold text-foreground">{topic}</p>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompt</Label>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                          {prompt}
                        </p>
                      </div>
                    </div>

                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full gap-2 transition-all disabled:opacity-50" size="default">
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Sending..." : "Generate & Send"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplateId} onOpenChange={() => setEditingTemplateId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Modify the template name and content below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={editedTemplateName}
                onChange={(e) => setEditedTemplateName(e.target.value)}
                placeholder="Template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-text">Template Content</Label>
              <Textarea
                id="template-text"
                value={editedTemplateText}
                onChange={(e) => setEditedTemplateText(e.target.value)}
                placeholder="Template content"
                className="min-h-[300px] font-mono text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingTemplateId(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </SidebarProvider>;
};
export default Index;