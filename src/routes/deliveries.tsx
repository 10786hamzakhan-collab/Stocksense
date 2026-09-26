import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { DeliveriesPage } from "@/components/inventory-pages";

export const Route = createFileRoute("/deliveries")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedPage,
});

function AuthenticatedPage() {
  const { user } = Route.useRouteContext();
  return (
    <AppShell email={user.email ?? ""}>
      <DeliveriesPage />
    </AppShell>
  );
}
