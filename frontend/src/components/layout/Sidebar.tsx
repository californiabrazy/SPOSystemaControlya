"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Folder,
  AlertTriangle,
  BarChart,
  Settings,
  Users,
  LogOut,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import LogoutModal from "../forms/QuitModal";

interface JwtPayload {
  role?: string;
  [key: string]: unknown;
}

interface SidebarProps {
  activeTab?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!; 

export default function Sidebar({ activeTab }: SidebarProps) {
  const isActive = (tabId: string) => tabId === activeTab;
  const router = useRouter();
  const pathname = usePathname();
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
    { id: "admin_users", label: "Пользователи", icon: <Users size={20} />, href: "/admin/users" },
    { id: "admin_projects", label: "Проекты", icon: <FolderKanban size={20} />, href: "/admin/projects" },
    { id: "settings", label: "Настройки", icon: <Settings size={20} />, href: "/settings" },
  ];

  const visibleTabs = (() => {
  if (role === "Админ") {
    return tabs.filter(
      (tab) =>
        tab.id !== "projects" &&
        tab.id !== "defects" &&
        tab.id !== "reports" &&
        tab.id !== "dashboard"
    );
  }

  if (role === "Инженер") {
    return tabs.filter(
      (tab) =>
        tab.id !== "admin_users" && 
        tab.id !== "admin_projects" &&
        tab.id !== "reports"
    );
  }

  return tabs; 
})();


  const handleConfirmLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // отправка HttpOnly cookie
      });
    } catch (_err: unknown) {
      console.error("Ошибка при выходе:", _err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
      setIsLogoutOpen(false);
      router.push("/login");
    }
  };

  const handleClickLogo = () => {
    router.push("/");
  };

  return (
    <>
      <aside className="w-64 bg-white text-[#657166] p-6 shadow-md flex flex-col justify-between">
        <div>
          <div
            className="text-2xl font-bold flex justify-center text-[#8A9D67] mb-8 border rounded border-3 cursor-pointer"
            onClick={handleClickLogo}
          >
            СистемаКонтроля
          </div>
          <nav className="space-y-2">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center space-x-2 p-2 w-full text-left rounded transition-colors ${
                    isActive
                      ? "bg-[#8BBCC6] text-white"
                      : "hover:bg-[#8BBCC6] hover:text-white"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </Link>
              );
            })}
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
