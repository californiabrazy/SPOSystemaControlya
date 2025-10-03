"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import AddDefectModal from "@/components/forms/AddDefectModal";
import EditDefectModal from "@/components/forms/EditDefectModal";
import SelectDefectModal from "@/components/forms/SelectEditDefectModal";

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
  const [selectedDefectId, setSelectedDefectId] = useState<number | null>(null);
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

  const handleAddDefect = useCallback(async (defectData: {
    title: string;
    description: string;
    priority: string;
    projectId: number;
  }) => {
    try {
      const response = await fetch(`${API_URL}/api/defects/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(defectData),
      });
      if (!response.ok) throw new Error("Ошибка при добавлении дефекта");

      const result = await response.json();
      setDefects((prev) => [...prev, {
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
      }]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось добавить дефект");
    }
  }, []);

  const handleEditDefect = useCallback(async (id: number, defectData: {
    title?: string;
    description?: string;
    priority?: string;
    projectId?: number;
  }) => {
    try {
      const response = await fetch(`${API_URL}/api/defects/edit/byengineer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(defectData),
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
  }, []);

  const handleSelectDefect = useCallback((defectId: number) => {
    setSelectedDefectId(defectId);
    setShowSelectModal(false);
    setShowEditModal(true);
  }, []);

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Инженер") return null;

  return (
    <div className="bg-[#f0f9fa]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Дефекты</h1>
        <div className="flex gap-2">
          <button
            className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8]"
            onClick={() => setShowAddModal(true)}
          >
            Добавить
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded hover:bg-[#333333]"
            onClick={() => setShowSelectModal(true)}
          >
            Редактировать
          </button>
        </div>
      </div>

      {defects.length === 0 ? (
        <p className="text-[#657166] mt-4 flex justify-center">
          Нет добавленных дефектов
        </p>
      ) : (
        <div className="mt-4 grid gap-4 grid-cols-1">
          {defects.map((defect) => (
            <div
              key={defect.id}
              className="bg-white rounded shadow-md border border-gray-200 p-6 flex flex-row items-center justify-between gap-6 transition hover:shadow-lg"
            >
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-2">{defect.title}</h3>
                <p className="text-[#657166] text-base mb-4">{defect.description}</p>
                <div className="flex flex-wrap gap-2">
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
                    Приоритет: {PRIORITY_LABELS[defect.priority] || defect.priority}
                  </span>

                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      defect.status === "new"
                        ? "bg-[#D0E8FF]"
                        : defect.status === "in_progress"
                        ? "bg-[#E5D6FF]"
                        : defect.status === "resolved"
                        ? "bg-[#D1FCD8]"
                        : defect.status === "closed"
                        ? "bg-[#F3F4F6]"
                        : "bg-[#FEF3C7]"
                    } text-black`}
                  >
                    Статус: {STATUS_LABELS[defect.status] || defect.status}
                  </span>

                </div>
              </div>

              <div className="text-left text-[#657166] space-y-2 pl-6 border-gray-200 flex flex-col justify-center">
                <p>
                  <span className="font-medium text-black">Проект:</span>{" "}
                  {defect.project ? defect.project.name : `ID ${defect.projectId}`}
                </p>
                <p>
                  <span className="font-medium text-black">Автор:</span>{" "}
                  {defect.author
                    ? `${defect.author.first_name} ${defect.author.last_name} ${defect.author.middle_name}`
                    : `ID ${defect.authorId}`}
                </p>
                <p>
                  <span className="font-medium text-black">Создано:</span>{" "}
                  {new Date(defect.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium text-black">Обновлено:</span>{" "}
                  {new Date(defect.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddDefectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDefect}
        projects={projects}
      />

      <SelectDefectModal
        isOpen={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        onSelect={handleSelectDefect}
        defects={defects}
      />

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
    </div>
  );
}