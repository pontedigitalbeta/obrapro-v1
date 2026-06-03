import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    // Bind store to this user (data is namespaced by user id in localStorage).
    if (typeof window !== "undefined") {
      const current = localStorage.getItem("obrapro:current-user");
      if (current !== data.user.id) {
        localStorage.setItem("obrapro:current-user", data.user.id);
      }
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

function AuthenticatedLayout() {
  const hydrated = useStoreHydrated();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger />
            <span className="text-sm font-semibold text-muted-foreground">ObraPro Orçamentos</span>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {hydrated ? <Outlet /> : null}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
