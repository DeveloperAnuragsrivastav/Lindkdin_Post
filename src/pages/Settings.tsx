import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Webhook, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useProfiles } from "@/hooks/useProfiles";
import { useWebhooks } from "@/hooks/useWebhooks";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const { profiles, loading: loadingProfiles, deleteProfile } = useProfiles();
  const { webhooks, loading: loadingWebhooks, createWebhook, updateWebhook, deleteWebhook } = useWebhooks();

  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateWebhook = async () => {
    const events = newWebhook.events.split(",").map(e => e.trim()).filter(Boolean);
    await createWebhook(newWebhook.name, newWebhook.url, events);
    setNewWebhook({ name: "", url: "", events: "" });
    setDialogOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <SidebarTrigger className="hover:bg-accent/50" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage users and webhooks</p>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Users Section */}
              <Card className="border-border/50">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Users</CardTitle>
                        <CardDescription>Manage application users</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingProfiles ? (
                    <p className="text-muted-foreground">Loading users…</p>
                  ) : profiles.length === 0 ? (
                    <p className="text-muted-foreground">No users found.</p>
                  ) : (
                    <div className="space-y-3">
                      {profiles.map(profile => (
                        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{profile.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {profile.email}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProfile(profile.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Webhooks Section */}
              <Card className="border-border/50">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Webhook className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Webhooks</CardTitle>
                        <CardDescription>Configure webhook endpoints</CardDescription>
                      </div>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Webhook</DialogTitle>
                          <DialogDescription>Add a new webhook endpoint</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="webhook-name">Name</Label>
                            <Input 
                              id="webhook-name" 
                              value={newWebhook.name} 
                              onChange={e => setNewWebhook(prev => ({ ...prev, name: e.target.value }))} 
                              placeholder="My Webhook" 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="webhook-url">URL</Label>
                            <Input 
                              id="webhook-url" 
                              value={newWebhook.url} 
                              onChange={e => setNewWebhook(prev => ({ ...prev, url: e.target.value }))} 
                              placeholder="https://example.com/webhook" 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="webhook-events">Events (comma-separated)</Label>
                            <Input 
                              id="webhook-events" 
                              value={newWebhook.events} 
                              onChange={e => setNewWebhook(prev => ({ ...prev, events: e.target.value }))} 
                              placeholder="submission.created, config.updated" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateWebhook}>Create Webhook</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingWebhooks ? (
                    <p className="text-muted-foreground">Loading webhooks…</p>
                  ) : webhooks.length === 0 ? (
                    <p className="text-muted-foreground">No webhooks configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {webhooks.map(webhook => (
                        <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-medium text-foreground">{webhook.name}</p>
                              <Switch 
                                checked={webhook.is_active} 
                                onCheckedChange={(checked) => updateWebhook(webhook.id, { is_active: checked })}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{webhook.url}</p>
                            <p className="text-xs text-muted-foreground">
                              Events: {webhook.events.join(", ") || "None"}
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {webhook.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteWebhook(webhook.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
