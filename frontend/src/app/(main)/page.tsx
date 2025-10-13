"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import LeaderReportDetailsModal from "@/components/forms/ReportDetailsModalLeader";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  created_at: string;
  user?: { first_name: string; last_name: string };
  project?: { name: string };
};

type DefectStats = {
  total_registered: number;
  closed: number;
  new: number;
  resolved: number;
  in_progress: number;
};

type ReportsStats = {
  date: string;
  count: number;
};

export default function DashboardPage() {
  const { checkToken } = useToken();
  const router = useRouter();
  const { loading: roleLoading, role } = useRoleGuard(["Менеджер", "Руководитель"]);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [showReportsList, setShowReportsList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [defectStats, setDefectStats] = useState<DefectStats | null>(null);
  const [reportsStats, setReportsStats] = useState<ReportsStats[]>([]);

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

        // --- Менеджер ---
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

        // --- Руководитель ---
        if (role === "Руководитель") {
          // Получаем все отчеты
          const reportsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/all`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!reportsRes.ok) throw new Error("Ошибка при загрузке всех отчетов");
          const reportsData = await reportsRes.json();
          setReports(reportsData.reports || reportsData);

          // Получаем статистику дефектов
          const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/defects/stats`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setDefectStats(statsData);
          }

          // Получаем статистику отчетов за последнюю неделю
          const reportsStatsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/stats`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (reportsStatsRes.ok) {
            const weeklyData = await reportsStatsRes.json();
            setReportsStats(weeklyData);
          }
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

  // --- Менеджер ---
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

  // --- Руководитель ---
  if (role === "Руководитель") {
    return (
      <div>
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Добрый день{firstName ? `, ${firstName}` : ""}!
          </h1>
        </div>

        {/* ===== ПЕРВАЯ СТРОКА: СПИСОК ОТЧЕТОВ ===== */}
        <div className="flex justify-start mb-2">
          <div className="w-full">
            <button
              className="text-black bg-white p-4 rounded shadow-sm w-full text-left flex justify-between items-center"
              onClick={() => setShowReportsList((prev) => !prev)}
            >
              <span>Все отчеты ({reports.length})</span>
              {showReportsList ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showReportsList && (
              <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm w-full">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <div
                      key={r.id}
                      className="cursor-pointer flex justify-between items-center py-2 px-2 hover:bg-gray-50 rounded-md"
                      onClick={() => setSelectedReport(r)}
                    >
                      <div>
                        <p className="font-medium text-black">{r.title}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    Отчеты отсутствуют
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== ВТОРАЯ СТРОКА: ГРАФИК + ДИАГРАММА ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* ГРАФИК ОТЧЕТОВ */}
          {reportsStats.length > 0 && (
            <div className="bg-white p-4 rounded shadow-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Отчеты за последнюю неделю
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={reportsStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(d) =>
                      new Date(d).toLocaleDateString("ru-RU")
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#4A5678"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ДИАГРАММА ДЕФЕКТОВ */}
          {defectStats && (
            <div className="bg-white p-4 rounded shadow-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Статистика дефектов
              </h2>
              <div className="flex items-center justify-center">
                <PieChart width={350} height={250}>
                  <Pie
                    data={[
                      { name: "Новые", value: defectStats.new },
                      { name: "Решённые", value: defectStats.resolved },
                      { name: "Закрытые", value: defectStats.closed },
                      { name: "В работе", value: defectStats.in_progress },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                  >
                    <Cell fill="#FFC107" />
                    <Cell fill="#2196F3" />
                    <Cell fill="#4CAF50" />
                    <Cell fill="#a83368ff" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
          )}
        </div>

        {/* МОДАЛКА ДЕТАЛЕЙ */}
        <LeaderReportDetailsModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
        />
      </div>
    );
  }



  // --- Нет доступа ---
  return <div>Нет доступа</div>;
}
