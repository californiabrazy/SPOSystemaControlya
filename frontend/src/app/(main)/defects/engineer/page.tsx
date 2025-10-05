"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import AddDefectModal from "@/components/forms/AddDefectModal";
import EditDefectModal from "@/components/forms/EditDefectModal";
import SelectDefectModal from "@/components/forms/SelectEditDefectModal";
import DefectDetailsModal from "@/components/forms/DefectDetailsModal";

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  author?: { id: number; first_name: string; last_name: string; middle_name: string };
  project?: { id: number; name: string };
};

type Project = {
  id: number;
  name: string;
};

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

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function Defects() {
  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Инженер"]);
  const [dataLoading, setDataLoading] = useState(true);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Новое состояние для модалки деталей
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null); // Выбранный дефект для деталей
  const [selectedDefectId, setSelectedDefectId] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        // Fetch defects
        const defectsResponse = await fetch(`${API_URL}/api/defects/yours`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!defectsResponse.ok) throw new Error("Ошибка при загрузке дефектов");
        const fetchedDefects: Defect[] = await defectsResponse.json();
        setDefects(fetchedDefects);

        // Fetch projects
        const projectsResponse = await fetch(`${API_URL}/api/admin/projects`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!projectsResponse.ok) throw new Error("Ошибка при загрузке проектов");
        const fetchedProjects: Project[] = await projectsResponse.json();
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Ошибка:", err);
        router.push("/login");
      } finally {
        setDataLoading(false);
      }
    };
    initialize();
  }, [checkToken, router]);

  const handleAddDefect = useCallback(async (formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/api/defects/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Ошибка при добавлении дефекта");

      const result = await response.json();
      setDefects((prev) => [
        ...prev,
        {
          id: result.defect.id,
          title: result.defect.title,
          description: result.defect.description,
          priority: result.defect.priority,
          status: result.defect.status,
          projectId: result.defect.project_id,
          authorId: result.defect.author_id,
          createdAt: result.defect.created_at,
          updatedAt: result.defect.updated_at,
          author: result.defect.author,
          project: result.defect.project,
          attachments: result.defect.attachments || [],
        },
      ]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось добавить дефект");
    }
  }, []);

  const handleEditDefect = useCallback(
  async (id: number, formData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/api/defects/edit/byengineer/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Ошибка при редактировании дефекта");

      const result = await response.json();
      setDefects((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...result.defect } : d))
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось редактировать дефект");
    }
  },
  []
);


  const handleSelectDefect = useCallback((defectId: number) => {
    setSelectedDefectId(defectId);
    setShowSelectModal(false);
    setShowEditModal(true);
  }, []);

  if (dataLoading || roleLoading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (role !== "Инженер") return null;

  return (
    <div className="bg-[#f0f9fa]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Дефекты</h1>
        <div className="flex gap-3">
          <button
            className="bg-[#8BBCC6] text-white px-4 py-2 rounded-md hover:bg-[#99CDD8] transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Добавить
          </button>
          <button
            className="bg-[#4A5678] text-white px-4 py-2 rounded-md hover:bg-[#37415C] transition-colors"
            onClick={() => setShowSelectModal(true)}
          >
            Редактировать
          </button>
        </div>
      </div>

      {defects.length === 0 ? (
        <p className="text-[#657166] mt-6 flex justify-center text-lg">Нет добавленных дефектов</p>
      ) : (
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {defects.map((defect) => {

            return (
              <div
                key={defect.id}
                className="relative w-full max-w-[300px] mx-auto"
                onClick={() => {
                  setSelectedDefect(defect);
                  setShowDetailsModal(true);
                }}
                onMouseMove={(e) => {
                  setTooltipPos({ x: e.clientX + 10, y: e.clientY + 10 }); // смещение от курсора
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {/* Карточка */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col gap-3 transition hover:shadow-lg cursor-pointer">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{defect.title}</h3>
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
                      Приоритет: {PRIORITY_LABELS[defect.priority] || defect.priority}
                    </span>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        defect.status === "new"
                          ? "bg-[#D0E8FF]"
                          : defect.status === "in_progress"
                          ? "bg-[#E5D6FF]"
                          : defect.status === "resolved"
                          ? "bg-[#D1FCD8]"
                          : defect.status === "closed"
                          ? "bg-[#F3F4F6]"
                          : "bg-[#FEF3C7]"
                      } text-black w-fit`}
                    >
                      Статус: {STATUS_LABELS[defect.status] || defect.status}
                    </span>
                  </div>
                </div>

                {/* Тултип около курсора */}
                {showTooltip && (
                  <span
                    className="fixed bg-[#8A9D67] text-white text-xs px-2 py-1 rounded shadow-md pointer-events-none z-50"
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                  >
                    Подробнее
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddDefectModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddDefect} projects={projects} />
      <SelectDefectModal isOpen={showSelectModal} onClose={() => setShowSelectModal(false)} onSelect={handleSelectDefect} defects={defects} />
      <EditDefectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDefectId(null);
        }}
        onSubmit={handleEditDefect}
        projects={projects}
        defects={defects}
        selectedDefectId={selectedDefectId}
      />
      <DefectDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        defect={selectedDefect}
      />
    </div>
  );
}