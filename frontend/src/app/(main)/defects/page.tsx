"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import AddDefectModal from "@/components/forms/AddDefectModal";

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
  author?: { id: number; first_name: string; last_name: string };
  project?: { id: number; name: string };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function Defects() {
  const { checkToken } = useToken();
  const { loading: roleLoading, role } = useRoleGuard(["Инженер"]);
  const [dataLoading, setDataLoading] = useState(true);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/defects/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Ошибка при загрузке дефектов");
        }

        const fetchedDefects: Defect[] = await response.json();
        setDefects(fetchedDefects);
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
    authorId: number;
  }) => {
    try {
      const response = await fetch(`${API_URL}/api/defects/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(defectData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении дефекта");
      }

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

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (role !== "Инженер") return null;

  return (
    <div className="bg-[#f0f9fa]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Дефекты</h1>
        <button
          className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8]"
          onClick={() => setShowAddModal(true)}
        >
          Добавить
        </button>
      </div>

      {defects.length === 0 ? (
        <p className="text-[#657166] mt-4 flex justify-center">
            Нет добавленных дефектов
        </p>
        ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {defects.map((defect) => (
            <div
                key={defect.id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col justify-between transition hover:shadow-lg"
            >
                {/* Заголовок */}
                <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {defect.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {defect.description}
                </p>
                </div>

                {/* Метки */}
                <div className="flex flex-wrap gap-2 mb-3">
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                    defect.priority === "critical"
                        ? "bg-red-100 text-red-700"
                        : defect.priority === "high"
                        ? "bg-orange-100 text-orange-700"
                        : defect.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                    Приоритет: {defect.priority}
                </span>
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                    defect.status === "new"
                        ? "bg-blue-100 text-blue-700"
                        : defect.status === "in_progress"
                        ? "bg-purple-100 text-purple-700"
                        : defect.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : defect.status === "closed"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    Статус: {defect.status}
                </span>
                </div>

                {/* Мета-инфо */}
                <div className="mt-auto text-xs text-gray-500 space-y-1 border-t pt-3">
                <p>
                    <span className="font-medium text-gray-700">Проект:</span>{" "}
                    {defect.project ? defect.project.name : `ID ${defect.projectId}`}
                </p>
                <p>
                    <span className="font-medium text-gray-700">Автор:</span>{" "}
                    {defect.author
                    ? `${defect.author.first_name} ${defect.author.last_name}`
                    : `ID ${defect.authorId}`}
                </p>
                <p>
                    <span className="font-medium text-gray-700">Создано:</span>{" "}
                    {new Date(defect.createdAt).toLocaleString()}
                </p>
                <p>
                    <span className="font-medium text-gray-700">Обновлено:</span>{" "}
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
      />
    </div>
  );
}