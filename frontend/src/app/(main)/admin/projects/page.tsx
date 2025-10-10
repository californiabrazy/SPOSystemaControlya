"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ObjectModal from "@/components/forms/AddObjectModal";
import DeleteObjectModal from "@/components/forms/DeleteObjectModal";
import ConfirmDeleteModal from "@/components/forms/ConfirmDeleteObjectModal";
import { useToken } from "@/hooks/useToken";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import {User, ObjectItem} from "@/types/models"

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ProjectsPage() {
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showDeleteObjectModal, setShowDeleteObjectModal] = useState(false);
  const [showConfirmDeleteObjectModal, setShowConfirmDeleteObjectModal] = useState(false);
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const router = useRouter();

  const { checkToken } = useToken();
  const { loading: roleLoading } = useRoleGuard(["Админ"]);

  const fetchObjects = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Ошибка загрузки объектов");

      const data: ObjectItem[] = await res.json();
      setObjects(data);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки объектов");
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/available_managers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Ошибка загрузки менеджеров");

      const data: User[] = await res.json();
      setManagers(data);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки менеджеров");
    }
  }, []);

  const addObject = useCallback(
    async (objectData: { name: string; manager_id: number; description: string }) => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/add/project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(objectData),
          credentials: "include",
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Ошибка создания объекта");
          return;
        }

        await fetchObjects();
        setShowObjectModal(false);
      } catch {
        setError("Ошибка запроса к серверу");
      }
    },
    [fetchObjects]
  );

  const deleteObject = useCallback(
    async (deleteData: { id: number }) => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/delete/project`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify(deleteData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Ошибка при удалении объекта");
        }

        await fetchObjects();
        setShowConfirmDeleteObjectModal(false);
        setShowDeleteObjectModal(false);
        setSelectedObject(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Ошибка удаления");
      }
    },
    [fetchObjects]
  );

  useEffect(() => {
    const initialize = async () => {
      setDataLoading(true);
      try {
        const tokenOk = await checkToken();
        if (!tokenOk) return; 

        await Promise.all([fetchObjects(), fetchManagers()]);
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке данных");
      } finally {
        setDataLoading(false);
      }
    };
    initialize();
  }, [checkToken, fetchObjects, fetchManagers]);

  const handleSelectObject = (object: ObjectItem) => {
    setSelectedObject(object);
    setShowDeleteObjectModal(false);
    setShowConfirmDeleteObjectModal(true);
  };

  if (dataLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-[#f0f9fa]">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Строительные объекты</h2>
          <div className="flex gap-2">
            <button
              className="bg-[#8BBCC6] text-white px-4 py-2 rounded hover:bg-[#99CDD8]"
              onClick={() => setShowObjectModal(true)}
            >
              Добавить
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
              onClick={() => setShowDeleteObjectModal(true)}
            >
              Удалить
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded shadow-md overflow-hidden table-fixed">
            <thead>
              <tr className="bg-[#8BBCC6] text-white">
                <th className="py-3 px-4 text-left font-normal w-1/3">Название</th>
                <th className="py-3 px-4 text-left font-normal w-1/3">Описание</th>
                <th className="py-3 px-4 text-left font-normal w-1/3">Менеджер</th>
              </tr>
            </thead>
            <tbody>
              {objects.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-center text-[#657166]">
                    Нет объектов
                  </td>
                </tr>
              ) : (
                objects.map((obj) => (
                  <tr key={obj.id} className="hover:bg-gray-100">
                    <td className="py-3 px-4 text-black">{obj.name}</td>
                    <td className="py-3 px-4 text-black">{obj.description}</td>
                    <td className="py-3 px-4 text-black">
                      {obj.manager
                        ? `${obj.manager.first_name} ${obj.manager.last_name} ${obj.manager.middle_name}`
                        : "Не назначен"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ObjectModal
          isOpen={showObjectModal}
          onClose={() => setShowObjectModal(false)}
          managers={managers}
          onSubmit={addObject}
        />
        <DeleteObjectModal
          isOpen={showDeleteObjectModal}
          onClose={() => setShowDeleteObjectModal(false)}
          objects={objects}
          onSelect={handleSelectObject}
        />
        <ConfirmDeleteModal
          isOpen={showConfirmDeleteObjectModal}
          onClose={() => {
            setShowConfirmDeleteObjectModal(false);
            setSelectedObject(null);
          }}
          object={selectedObject}
          onConfirm={() => selectedObject && deleteObject({ id: selectedObject.id })}
        />
      </div>
    </div>
  );
}
