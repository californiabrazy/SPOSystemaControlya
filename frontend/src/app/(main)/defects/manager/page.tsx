"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import DefectEditModal from "@/components/forms/ManagerEditDefectModal";
import SelectDefectModal from "@/components/forms/SelectManagerEditDefectModal";

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  assignee?: string;
  project?: { id: number; name: string };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Критический",
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  in_progress: "В работе",
  resolved: "Решён",
  closed: "Закрыт",
};

export default function ManagerDefects() {
  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Менеджер"]);
  const [dataLoading, setDataLoading] = useState(true);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [filteredDefects, setFilteredDefects] = useState<Defect[]>([]);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/api/defects/yours/manager`, {
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

  // Фильтрация дефектов
  useEffect(() => {
    let result = [...defects];

    // Применение фильтров
    if (filters.priority) {
      result = result.filter((defect) => defect.priority === filters.priority);
    }
    if (filters.status) {
      result = result.filter((defect) => defect.status === filters.status);
    }

    setFilteredDefects(result);
  }, [defects, filters]);

  const handleEditDefect = useCallback(
    async (id: number, updatedFields: { assignee?: string; status?: string }) => {
      try {
        const res = await fetch(`${API_URL}/api/defects/edit/bymanager/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(updatedFields),
        });
        if (!res.ok) throw new Error("Ошибка при редактировании дефекта");

        const result = await res.json();
        setDefects((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...result.defect } : d))
        );
        setSelectedDefect(null);
      } catch (err) {
        console.error(err);
        alert("Не удалось обновить дефект");
      }
    },
    []
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Менеджер") return null;

  return (
    <div className="bg-[#f0f9fa]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Дефекты</h1>
          <div className="flex gap-3">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-[150px] h-[40px] rounded bg-white px-2 py-1 text-sm text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              <option value="">Все приоритеты</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-[150px] h-[40px] rounded bg-white px-2 py-1 text-sm text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              <option value="">Все статусы</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="bg-[#4A5678] text-white px-4 py-2 rounded-md hover:bg-[#37415C] transition-colors"
          onClick={() => setShowSelectModal(true)}
        >
          Редактировать
        </button>
      </div>

      {filteredDefects.length === 0 ? (
        <p className="text-[#657166] mt-6 flex justify-center text-lg">Нет дефектов</p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDefects.map((defect) => (
            <div
              key={defect.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col gap-3 transition hover:shadow-lg cursor-pointer w-full max-w-[300px] mx-auto"
            >
              {/* Верхняя часть: название и описание */}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">{defect.title}</h3>

                {/* Приоритет и статус */}
                <div className="flex flex-col gap-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      defect.priority === "critical"
                        ? "bg-[#F3B2AA]"
                        : defect.priority === "high"
                        ? "bg-[#F3C3B2]"
                        : defect.priority === "medium"
                        ? "bg-[#F3D1B2]"
                        : "bg-[#F3E0B2]"
                    } text-black w-fit`}
                  >
                    Приоритет: {PRIORITY_LABELS[defect.priority]}
                  </span>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      defect.status === "new"
                        ? "bg-[#D0E8FF]"
                        : defect.status === "in_progress"
                        ? "bg-[#E5D6FF]"
                        : defect.status === "resolved"
                        ? "bg-[#D1FCD8]"
                        : "bg-[#F3F4F6]"
                    } text-black w-fit`}
                  >
                    Статус: {STATUS_LABELS[defect.status]}
                  </span>
                </div>
              </div>

              {/* Нижняя часть: исполнитель и проект */}
              <div className="text-[#657166] space-y-1 text-sm">
                <p>
                  <span className="font-medium text-black">Исполнитель:</span>{" "}
                  {defect.assignee || "не назначен"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка выбора дефекта */}
      <SelectDefectModal
        defects={defects}
        isOpen={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        onSelect={(def) => {
          setSelectedDefect(def);
          setShowSelectModal(false);
        }}
      />

      {/* Модалка редактирования выбранного дефекта */}
      <DefectEditModal
        defect={selectedDefect}
        isOpen={!!selectedDefect}
        onClose={() => setSelectedDefect(null)}
        onSave={handleEditDefect}
      />
    </div>
  );
}