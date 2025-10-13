"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import ReportModal from "@/components/forms/AssigneeAddReportModal";
import SelectDefectModal from "@/components/forms/SelectDefectAssigneeModal";

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  assignee_id?: number;
  assignee?: { id: number; first_name: string; last_name: string };
  project?: { id: number; name: string };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Критический",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

export default function MyDefects() {
  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Исполнитель"]);
  const [dataLoading, setDataLoading] = useState(true);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/api/defects/yours/assignee`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Ошибка при загрузке дефектов");
        const data: Defect[] = await res.json();
        setDefects(data);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setDataLoading(false);
      }
    };

    fetchDefects();
  }, [checkToken, router]);

  const handleDefectSelect = (defectId: number) => {
    const defect = defects.find((d) => d.id === defectId);
    if (defect) setSelectedDefect(defect);
    setSelectModalOpen(false);
  };

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Исполнитель") return null;

  return (
    <div className="bg-[#f0f9fa]">
      {/* === Заголовок и кнопка справа === */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Отчёты по дефектам</h1>
        <button
          onClick={() => setSelectModalOpen(true)}
          className="bg-[#4A5678] text-white px-6 py-2 rounded-md hover:bg-[#37415C] transition"
        >
          Добавить отчёт
        </button>
      </div>

      {defects.length === 0 ? (
        <p className="text-gray-600 mt-6 flex justify-center text-lg">
          Нет назначенных дефектов
        </p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {defects.map((defect) => (
            <div
              key={defect.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col gap-3"
            >
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                {defect.title}
              </h3>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  defect.priority === "critical" ? "bg-[#F3B2AA]" : "bg-[#F3E0B2]"
                } text-black w-fit`}
              >
                Приоритет: {PRIORITY_LABELS[defect.priority]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* === Модалка выбора дефекта === */}
      <SelectDefectModal
        isOpen={selectModalOpen}
        onClose={() => setSelectModalOpen(false)}
        onSelect={handleDefectSelect}
        defects={defects}
      />

      {/* === Модалка создания отчёта === */}
      {selectedDefect && (
        <ReportModal
          defect={selectedDefect}
          isOpen={!!selectedDefect}
          onClose={() => setSelectedDefect(null)}
          onSave={() => {
            setDefects((prev) => prev.filter((d) => d.id !== selectedDefect.id));
            setSelectedDefect(null);
          }}
        />
      )}
    </div>
  );
}