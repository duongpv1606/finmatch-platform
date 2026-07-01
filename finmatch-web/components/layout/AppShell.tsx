"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

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
    </>
  );
}
