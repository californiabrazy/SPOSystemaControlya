"use client";

import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const activeTab =
    pathname === "/" ? "dashboard" : pathname.split("/")[1] || "dashboard";

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      <Sidebar activeTab={activeTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-[#F0F9FA]">{children}</main>
      </div>
    </div>
  );
}
