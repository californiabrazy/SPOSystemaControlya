"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import SelectReportModal from "@/components/forms/SelectReporEngineerModal";
import ReportReviewModal from "@/components/forms/ReviewReportEngineer";


const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Defect = {
  id: number;
  title: string;
  status: string;
};

type Report = {
  id: number;
  title: string;
  description: string;
  attachments: string[];
  status: string;
  defect: Defect;
};

export default function ReportsPage() {
  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Инженер"]);
  const [dataLoading, setDataLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const router = useRouter();

  // === Загрузка отчётов ===
  const fetchReports = async () => {
    setDataLoading(true);
    try {
      const tokenOk = await checkToken();
      if (!tokenOk) {
        router.push("/login");
        return;
      }
      const res = await fetch(`${API_URL}/api/reports/yours/engineer/pending`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Ошибка загрузки отчётов");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить отчёты");
      router.push("/login");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [checkToken, router]);

  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
    setSelectModalOpen(false);
  };

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Инженер") return null;

  return (
    <div className="bg-[#f0f9fa]">
      {/* === Заголовок и кнопка справа === */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Отчёты, ожидающие проверки</h1>
        <button
          onClick={() => setSelectModalOpen(true)}
          className="bg-[#4A5678] text-white px-6 py-2 rounded-md hover:bg-[#37415C] transition"
        >
          Проверить
        </button>
      </div>

      {reports.length === 0 ? (
        <p className="text-[#657166] mt-6 flex justify-center text-lg">
          Нет отчётов для проверки
        </p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded shadow-md border border-gray-200 p-4 flex flex-col gap-3"
            >
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600">
                Дефект: {report.defect?.title || "—"}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {report.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* === Модалка выбора отчёта === */}
      <SelectReportModal
        isOpen={selectModalOpen}
        onClose={() => setSelectModalOpen(false)}
        onSelect={handleReportSelect}
        reports={reports}
      />

      {/* === Модалка проверки === */}
      {selectedReport && (
        <ReportReviewModal
          isOpen={!!selectedReport}
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={() => {
            setSelectedReport(null);
            fetchReports();
          }}
        />
      )}
    </div>
  );
}