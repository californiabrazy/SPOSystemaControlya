"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import SelectReportModal from "@/components/forms/SelectReportManagerModal";
import ReportReviewModal from "@/components/forms/ReviewReportManagerModal";

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

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает проверки",
  approve: "Подтверждено",
  reject: "Отклонено",
};

export default function ReportsPage() {
  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Менеджер"]);
  const [dataLoading, setDataLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [filters, setFilters] = useState({ status: "" });
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

      const res = await fetch(`${API_URL}/api/reports/yours/manager/pending`, {
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

  useEffect(() => {
    let result = [...reports];
    if (filters.status) {
      result = result.filter((report) => report.status === filters.status);
    }
    setFilteredReports(result);
  }, [reports, filters]);

  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
    setSelectModalOpen(false);
  };

  const handleCardClick = (report: Report) => {
    setSelectedReport(report); // открываем окно проверки при клике
  };

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Менеджер") return null;

  return (
    <div className="bg-[#f0f9fa]">
      {/* === Заголовок и кнопки === */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Отчёты, ожидающие проверки</h1>
        <button
          onClick={() => setSelectModalOpen(true)}
          className="bg-[#4A5678] text-white px-6 py-2 rounded-md hover:bg-[#37415C] transition"
        >
          Поиск...
        </button>
      </div>

      {/* === Список отчётов === */}
      {filteredReports.length === 0 ? (
        <p className="text-[#657166] mt-6 flex justify-center text-lg">
          Нет отчётов для проверки
        </p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleCardClick(report)} // 👈 добавлено
              className="bg-white rounded shadow-md border border-gray-200 p-4 flex flex-col gap-3 transition hover:shadow-lg cursor-pointer"
            >
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-sm text-black">Дефект: {report.defect?.title || "—"}</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  report.status === "pending"
                    ? "bg-[#D0E8FF]"
                    : report.status === "approved"
                    ? "bg-[#D1FCD8]"
                    : "bg-[#F3B2AA]"
                } text-black w-fit`}
              >
                Статус дефекта: {STATUS_LABELS[report.status]}
              </span>
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
          onDecision={() => {
            setSelectedReport(null);
            fetchReports();
          }}
        />
      )}
    </div>
  );
}
