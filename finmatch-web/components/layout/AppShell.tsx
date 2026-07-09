"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { FloatingAskAI } from "@/components/shared/FloatingAskAI";

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="main">
        <Topbar title={title} />
        {children}
      </div>
      <FloatingAskAI />
    </>
  );
}
