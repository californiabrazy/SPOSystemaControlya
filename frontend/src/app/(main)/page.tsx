"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  created_at: string;
  user?: { first_name: string; last_name: string };
  project?: { name: string };
};

export default function DashboardPage() {
  const { checkToken } = useToken();
  const router = useRouter();
  const { loading: roleLoading, role } = useRoleGuard(["Менеджер", "Руководитель"]);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [showReportsList, setShowReportsList] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setFirstName(user?.first_name || null);
        }

        if (role === "Менеджер") {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/yours/manager`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!res.ok) throw new Error("Ошибка при загрузке отчетов");
          const data = await res.json();
          setReports(data.reports || data);
        }

        if (role === "Руководитель") {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/all`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!res.ok) throw new Error("Ошибка при загрузке всех отчетов");
          const data = await res.json();
          setReports(data.reports || data);
        }
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [checkToken, router, role]);

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role === "Менеджер") {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Добрый день{firstName ? `, ${firstName}` : ""}!
          </h1>
        </div>

        <div className="w-1/2">
          <button
            className="text-black bg-white p-4 rounded-md shadow-sm w-full text-left flex justify-between items-center"
            onClick={() => setShowReportsList((prev) => !prev)}
          >
            <span>Отчеты, которые нужно проверить:</span>
            {showReportsList ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showReportsList && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm">
              {reports.length > 0 ? (
                reports.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center py-2 px-2 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-black">{r.title}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push("/reports/manager")}
                      className="bg-[#4A5678] text-white px-4 py-1 rounded-md hover:bg-[#37415C]"
                    >
                      Проверить
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">Отчеты отсутствуют</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (role === "Руководитель") {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Добрый день{firstName ? `, ${firstName}` : ""}!
          </h1>
        </div>

        <div className="w-1/2">
          <button
            className="text-black bg-white p-4 rounded-md shadow-sm w-full text-left flex justify-between items-center"
            onClick={() => setShowReportsList((prev) => !prev)}
          >
            <span>Все отчеты ({reports.length})</span>
            {showReportsList ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {showReportsList && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center py-2 px-2 hover:bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="font-medium text-black">{r.title}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/reports/manager")}
                    className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700"
                  >
                    Проверить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div>Нет доступа</div>;
}
