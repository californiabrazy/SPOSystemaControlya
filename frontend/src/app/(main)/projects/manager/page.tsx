"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import {ProjectSummary} from "@/types/models"

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ManagerProject() {
  const { checkToken } = useToken();
  const router = useRouter();
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const tokenOk = await checkToken();
      if (!tokenOk) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/projects/yours/manager`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!res.ok) throw new Error("Ошибка при загрузке проекта");

        const data: ProjectSummary[] = await res.json();
        setProject(data[0] || null);
      } catch (err) {
        console.error(err);
        router.push("/")
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [checkToken, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center">Проект не найден</div>;

  return (
    <div className="bg-[#f0f9fa]">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{project.name}</h1>
      <p className="text-gray-500 text-base bg-white p-4 rounded-md shadow-sm mb-2">{project.description}</p>

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Количество дефектов */}
        <div className="bg-white rounded shadow-md border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-lg transition">
          <h3 className="font-semibold text-gray-900 text-lg">Дефекты</h3>
          <p className="text-[#657166] text-sm">{project.defects_count} дефект(ов)</p>
        </div>

        {/* Количество инженеров */}
        <div className="bg-white rounded shadow-md border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-lg transition">
          <h3 className="font-semibold text-gray-900 text-lg">Инженеры</h3>
          <p className="text-[#657166] text-sm">{project.engineers_count} инженер(ов)</p>
        </div>

        {/* Количество исполнителей дефектов */}
        <div className="bg-white rounded shadow-md border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-lg transition">
          <h3 className="font-semibold text-gray-900 text-lg">Исполнители</h3>
          <p className="text-[#657166] text-sm">{project.assignees_count} работник(ов)</p>
        </div>
      </div>
    </div>
  );
}
