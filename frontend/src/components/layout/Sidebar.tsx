"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Folder,
  AlertTriangle,
  BarChart,
  Settings,
  BrickWallShield,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // исправлено
import LogoutModal from "../forms/QuitModal";

interface SidebarProps {
  activeTab: string;
}

interface JwtPayload {
  role?: string;
  [key: string]: unknown; // вместо any
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token); 
        if (decoded.role && typeof decoded.role === "string") {
          setRole(decoded.role);
        }
      } catch (_err: unknown) {
        console.error("Ошибка при декодировании токена:", _err);
      }
    }
  }, []);

  const tabs = [
    { id: "dashboard", label: "Дашборд", icon: <LayoutDashboard size={20} />, href: "/" },
    { id: "projects", label: "Проекты", icon: <Folder size={20} />, href: "/projects" },
    { id: "defects", label: "Дефекты", icon: <AlertTriangle size={20} />, href: "/defects" },
    { id: "reports", label: "Отчеты", icon: <BarChart size={20} />, href: "/reports" },
    { id: "admin", label: "Управление", icon: <BrickWallShield size={20} />, href: "/admin" },
    { id: "settings", label: "Настройки", icon: <Settings size={20} />, href: "/settings" },
  ];

  const visibleTabs =
    role === "Админ"
      ? tabs.filter(
          (tab) =>
            tab.id !== "projects" &&
            tab.id !== "defects" &&
            tab.id !== "reports" &&
            tab.id !== "dashboard"
        )
      : tabs;

  const handleConfirmLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_err: unknown) {
      console.error("Ошибка при выходе:", _err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setIsLogoutOpen(false);
      router.push("/login");
    }
  };

  return (
    <>
      <aside className="w-64 bg-white text-[#657166] p-6 shadow-md flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold flex justify-center text-[#8A9D67] mb-8 border rounded border-3">
            СистемаКонтроля
          </div>
          <nav className="space-y-2">
            {visibleTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center space-x-2 p-2 w-full text-left rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#8BBCC6] text-white"
                    : "hover:bg-[#8BBCC6] hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={() => setIsLogoutOpen(true)}
          className="flex items-center space-x-2 p-2 w-full text-left rounded transition-colors text-white bg-black hover:bg-[#333333]"
        >
          <LogOut size={20} />
          <span>Выход</span>
        </button>
      </aside>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
