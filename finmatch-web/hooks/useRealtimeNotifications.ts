"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { getAccessToken } from "@/services/authService";
import { API_BASE_URL, USE_MOCK } from "@/services/apiClient";

// The Socket.IO gateway listens on the root path, not under NestJS's
// global "/api" REST prefix — strip it to get the correct connection URL.
const WS_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export function useRealtimeNotifications() {
  const { user } = useAppStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (USE_MOCK || !user) {
      socket?.disconnect();
      socket = null;
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    socket = io(WS_URL, { auth: { token }, reconnection: true });

    socket.on("new_message", () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    });

    socket.on("new_lead", () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace", "leads"] });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [user, queryClient]);
}
