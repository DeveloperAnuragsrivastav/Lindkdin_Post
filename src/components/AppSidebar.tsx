import { Settings, Home, BarChart3, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
const menuItems = [{
  title: "Dashboard",
  icon: Home,
  path: "/"
}, {
  title: "Reports",
  icon: BarChart3,
  path: "/reports"
}, {
  title: "Settings",
  icon: Settings,
  path: "/settings"
}];
export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar overflow-y-auto scrollbar-hide">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">​Tap Tap Go</h1>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} className="mx-3 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>;
}