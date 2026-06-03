import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, FileText, Settings, LogOut, User } from "lucide-react";
import logoIcon from "@/assets/obrapro-icon.png.asset.json";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { InstallAppButton } from "@/components/install-app-button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Orçamentos", url: "/orcamentos", icon: FileText },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  const [user, setUser] = useState<{ email?: string; nome?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? undefined,
          nome: (data.user.user_metadata?.nome as string | undefined) ?? (data.user.user_metadata?.full_name as string | undefined),
        });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Falha ao sair");
  };

  const handleNavClick = (url: string) => {
    if (isActive(url)) return;
    if (isMobile) setOpenMobile(false);
    else setOpen(false);
  };

  const displayName = user?.nome || user?.email?.split("@")[0] || "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-2 px-2 py-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-sidebar-border bg-white md:h-16 md:w-16">
            <img src={logoIcon.url} alt="ObraPro" className="h-11 w-11 object-contain md:h-12 md:w-12" />
          </div>
          {!collapsed && (
            <p className="text-base font-bold leading-none tracking-tight">
              <span className="text-sidebar-foreground">Obra</span>
              <span className="text-accent">Pro</span>
            </p>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 px-1 py-2">
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      size="lg"
                      tooltip={item.title}
                      className={[
                        "relative h-11 rounded-lg px-3 transition-all",
                        "before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-transparent before:transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm data-[active=true]:font-semibold",
                        "data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground",
                        "data-[active=true]:before:bg-accent",
                      ].join(" ")}
                    >
                      <Link
                        to={item.url}
                        onClick={() => handleNavClick(item.url)}
                        className="flex items-center gap-3"
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-transform ${active ? "scale-110" : ""}`} />
                        <span className="text-[15px] font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 pb-1 pt-2">
            <InstallAppButton
              variant="outline"
              size="sm"
              fullWidth
              hideWhenInstalled
              className="border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            />
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={displayName} className="cursor-default hover:bg-transparent">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {initials || <User className="h-3.5 w-3.5" />}
              </div>
              {!collapsed && (
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{displayName}</span>
                  {user?.email && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
