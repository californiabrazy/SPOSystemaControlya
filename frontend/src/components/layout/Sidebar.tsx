"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Folder,
  AlertTriangle,
  FileText,
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
    { id: "projects", label: "Проект", icon: <Folder size={20} />, href: "/projects/manager" },
    { id: "defects_engineer", label: "Дефекты", icon: <AlertTriangle size={20} />, href: "/defects/engineer" },
    { id: "defects_manager", label: "Дефекты", icon: <AlertTriangle size={20} />, href: "/defects/manager" },
    { id: "admin_users", label: "Пользователи", icon: <Users size={20} />, href: "/admin/users" },
    { id: "admin_projects", label: "Проекты", icon: <FolderKanban size={20} />, href: "/admin/projects" },
    { id: "reports_assignee", label: "Отчёты", icon: <AlertTriangle size={20} />, href: "/reports/assignee" },
    { id: "reports_manager", label: "Отчёты", icon: <FileText size={20} />, href: "/reports/manager" },
    { id: "reports_engineer", label: "Отчёты", icon: <FileText size={20} />, href: "/reports/engineer" },
  ];

  const visibleTabs = (() => {
    if (role === "Админ") {
      return tabs.filter(
        (tab) =>
          tab.id !== "projects" &&
          tab.id !== "defects_engineer" &&
          tab.id !== "defects_manager" &&
          tab.id !== "dashboard" &&
          tab.id !== "reports_assignee" &&
          tab.id !== "reports_manager" &&
          tab.id !== "reports_engineer"
      );
    }

    if (role === "Инженер") {
      return tabs.filter(
        (tab) =>
          tab.id !== "admin_users" &&
          tab.id !== "admin_projects" &&
          tab.id !== "defects_manager" &&
          tab.id !== "projects" &&
          tab.id !== "dashboard" &&
          tab.id !== "reports_assignee" &&
          tab.id !== "reports_manager"
      );
    }

    if (role === "Менеджер") {
      return tabs.filter(
        (tab) =>
          tab.id !== "admin_users" &&
          tab.id !== "admin_projects" &&
          tab.id !== "defects_engineer" &&
          tab.id !== "reports_assignee" &&
          tab.id !== "reports_engineer"
      );
    }

    if (role === "Руководитель") {
      return tabs.filter(
        (tab) =>
          tab.id !== "admin_users" &&
          tab.id !== "admin_projects" &&
          tab.id !== "defects_engineer" &&
          tab.id !== "projects" &&
          tab.id !== "defects_manager" &&
          tab.id !== "defects_engineer" &&
          tab.id !== "reports_assignee" &&
          tab.id !== "reports_manager" &&
          tab.id !== "reports_engineer"
      );
    }

    if (role === "Исполнитель") {
      return tabs.filter(
        (tab) =>
          tab.id !== "admin_users" &&
          tab.id !== "admin_projects" &&
          tab.id !== "defects_engineer" &&
          tab.id !== "projects" &&
          tab.id !== "defects_manager" &&
          tab.id !== "reports_manager" &&
          tab.id !== "dashboard" &&
          tab.id !== "reports_engineer"
      );
    }

    return tabs;
  })();

  const handleConfirmLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
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

  const handleClickLogo = () => {
    router.push("/");
  };

  return (
    <>
      <aside className="fixed top-0 left-0 w-64 h-screen bg-white text-[#657166] p-6 shadow-md flex flex-col justify-between">
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
          className="flex items-center space-x-2 p-2 w-full text-left rounded transition-colors text-white bg-[#4A5678] hover:bg-[#37415C]"
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