import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useStore } from "@/lib/store";
import logoFull from "@/assets/obrapro-logo.png.asset.json";

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
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white px-3 md:h-16 md:px-4">
            <SidebarTrigger />
            <img src={logoFull.url} alt="ObraPro" className="h-8 w-auto object-contain md:h-10" />
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            {hydrated ? <Outlet /> : null}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
