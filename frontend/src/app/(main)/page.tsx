"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import AddReportModal from "@/components/forms/AddReportModal";
import ReportDetailsModal from "@/components/forms/ReportDetailsModal";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type Project = {
  id: number;
  name: string;
};

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  created_at: string;
};

export default function DashboardPage() {
  const { checkToken } = useToken();
  const router = useRouter();
  const { loading: roleLoading, role } = useRoleGuard(["Менеджер"]);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
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

        const projectsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/your`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!projectsResponse.ok) throw new Error("Ошибка при загрузке проектов");
        setProjects(await projectsResponse.json());

        const reportsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/your`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!reportsResponse.ok) throw new Error("Ошибка при загрузке отчетов");
        setReports(await reportsResponse.json());
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [checkToken, router]);

  const handleAddReport = useCallback(async (formData: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при добавлении отчета");
      }
      const newReport = await response.json();
      setReports((prev) => [...prev, newReport.report]);
      setShowAddModal(false);
      alert("Отчет успешно создан");
    } catch (error) {
      console.error(error);
      alert("Не удалось создать отчет");
    }
  }, []);

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Менеджер") return null;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        {firstName ? (
          <h1 className="text-2xl font-bold text-gray-900">Добрый день, {firstName}!</h1>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">Добрый день!</h1>
        )}
        <button
          className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8] transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          Создать отчет
        </button>
      </div>

      {/* Секция "Ваш список отчетов" */}
      <div className="w-1/2">
        <button
          className="text-black bg-white p-4 rounded shadow-sm w-full text-left flex justify-between items-center"
          onClick={() => setShowReportsList((prev) => !prev)}
        >
          <span>Ваш список отчетов ({reports.length})</span>
          {showReportsList ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {showReportsList && (
          <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm">
            {reports.map((r) => (
              <div
                key={r.id}
                className="cursor-pointer py-2 hover:bg-gray-50"
                onClick={() => setSelectedReport(r)}
              >
                <p className="font-medium text-black">{r.title}</p>
                <p className="text-gray-500 text-sm">{new Date(r.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модалки */}
      <AddReportModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddReport}
        projects={projects}
      />

      <ReportDetailsModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
}