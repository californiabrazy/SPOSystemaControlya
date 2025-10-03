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
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/api/defects/all`, {
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

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Менеджер") return null;

  return (
    <div className="bg-[#f0f9fa] min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Дефекты</h1>
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-[#333333]"
          onClick={() => setShowSelectModal(true)}
        >
          Редактировать
        </button>
      </div>

      {defects.length === 0 ? (
        <p className="text-[#657166] flex justify-center mt-6">Нет дефектов</p>
      ) : (
        <div className="grid gap-4">
          {defects.map((defect) => (
            <div
              key={defect.id}
              className="bg-white p-6 rounded shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg transition"
            >
              {/* Левая часть */}
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-2">{defect.title}</h3>
                <p className="text-[#657166] text-base mb-4">{defect.description}</p>

                {/* Приоритет и статус */}
                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      defect.priority === "critical"
                        ? "bg-[#F3B2AA]"
                        : defect.priority === "high"
                        ? "bg-[#F3C3B2]"
                        : defect.priority === "medium"
                        ? "bg-[#F3D1B2]"
                        : "bg-[#F3E0B2]"
                    } text-black`}
                  >
                    {PRIORITY_LABELS[defect.priority]}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      defect.status === "new"
                        ? "bg-[#D0E8FF]"
                        : defect.status === "in_progress"
                        ? "bg-[#E5D6FF]"
                        : defect.status === "resolved"
                        ? "bg-[#D1FCD8]"
                        : "bg-[#F3F4F6]"
                    } text-black`}
                  >
                    {STATUS_LABELS[defect.status]}
                  </span>
                </div>
              </div>

              {/* Правая часть */}
              <div className="text-left text-[#657166] space-y-2 md:text-right md:pl-6 min-w-[200px]">
                <p>
                  <span className="font-medium text-black">Исполнитель:</span>{" "}
                  {defect.assignee || "не назначен"}
                </p>
                <p>
                  <span className="font-medium text-black">Проект:</span>{" "}
                  {defect.project ? defect.project.name : `ID ${defect.projectId}`}
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
