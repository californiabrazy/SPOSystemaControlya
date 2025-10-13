"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
}

interface Defect {
  id: number;
  title: string;
  description: string;
  author?: User;
  assignee?: User;
}

interface ProjectSummary {
  id: number;
  name: string;
  description: string;
  defects_count: number;
  engineers_count: number;
  assignees_count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ManagerProject() {
  const { checkToken } = useToken();
  const router = useRouter();
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDefects, setShowDefects] = useState(true);
  const [showEngineers, setShowEngineers] = useState(true);
  const [showAssignees, setShowAssignees] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const tokenOk = await checkToken();
      if (!tokenOk) {
        router.push("/login");
        return;
      }

      try {
        // Fetch project summary
        const projectRes = await fetch(`${API_URL}/api/projects/yours/manager`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!projectRes.ok) throw new Error("Ошибка при загрузке проекта");
        const projectData: ProjectSummary[] = await projectRes.json();
        setProject(projectData[0] || null);

        // Fetch defects
        const defectsRes = await fetch(`${API_URL}/api/defects/yours/manager`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!defectsRes.ok) throw new Error("Ошибка при загрузке дефектов");
        const defectsData: Defect[] = await defectsRes.json();
        setDefects(defectsData);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [checkToken, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center">Проект не найден</div>;

  const getFullName = (user: User) => {
    return `${user.first_name} ${user.last_name} ${user.middle_name}`.trim() || "Без имени";
  };

  // Уникальные инженеры (authors)
  const uniqueEngineers = Array.from(
    new Map(
      defects
        .filter((d) => d.author !== undefined)
        .map((d) => [d.author!.id, d.author!])
    ).values()
  ).filter((user) => getFullName(user) !== "Без имени");

  // Уникальные исполнители (assignees)
  const uniqueAssignees = Array.from(
    new Map(
      defects
        .filter((d) => d.assignee !== undefined)
        .map((d) => [d.assignee!.id, d.assignee!])
    ).values()
  ).filter((user) => getFullName(user) !== "Без имени");

  return (
    <div className="bg-[#f0f9fa]">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{project.name}</h1>
      <p className="text-gray-500 text-base bg-white p-4 rounded-md shadow-sm mb-2">{project.description}</p>

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Дефекты */}
        <div className="flex flex-col">
          <button
            className="bg-white rounded shadow-md border border-gray-200 p-4 flex justify-between items-center hover:shadow-lg transition cursor-pointer"
            onClick={() => setShowDefects(!showDefects)}
          >
            <div className="flex flex-col gap-2 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Дефекты</h3>
              <p className="text-black text-sm">{project.defects_count} дефект(ов)</p>
            </div>
            {showDefects ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showDefects && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm">
              {defects.map((defect) => (
                <div key={defect.id} className="mb-4">
                  <strong className="block">{defect.title}</strong>
                  <p>{defect.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Инженеры */}
        <div className="flex flex-col">
          <button
            className="bg-white rounded shadow-md border border-gray-200 p-4 flex justify-between items-center hover:shadow-lg transition cursor-pointer"
            onClick={() => setShowEngineers(!showEngineers)}
          >
            <div className="flex flex-col gap-2 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Инженеры</h3>
              <p className="text-black text-sm">{project.engineers_count} инженер(ов)</p>
            </div>
            {showEngineers ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showEngineers && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm">
              {uniqueEngineers.map((engineer) => (
                <div key={engineer.id} className="mb-2">
                  {getFullName(engineer)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Исполнители */}
        <div className="flex flex-col">
          <button
            className="bg-white rounded shadow-md border border-gray-200 p-4 flex justify-between items-center hover:shadow-lg transition cursor-pointer"
            onClick={() => setShowAssignees(!showAssignees)}
          >
            <div className="flex flex-col gap-2 text-left">
              <h3 className="font-semibold text-gray-900 text-lg">Исполнители</h3>
              <p className="text-black text-sm">{project.assignees_count} работник(ов)</p>
            </div>
            {showAssignees ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showAssignees && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded p-2 bg-white shadow-sm">
              {uniqueAssignees.map((assignee) => (
                <div key={assignee.id} className="mb-2">
                  {getFullName(assignee)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}