"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { QuickLeadModal } from "@/components/shared/QuickLeadModal";
import { useAppStore } from "@/store/useAppStore";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

// Must be a child of QueryClientProvider — the realtime hook needs
// useQueryClient(), which only works below the provider in the tree.
function RealtimeListener() {
  useRealtimeNotifications();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const hydrateFromStorage = useAppStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <AuthModal />
      <QuickLeadModal />
      <RealtimeListener />
    </QueryClientProvider>
  );
}
