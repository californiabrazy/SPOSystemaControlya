"use client";

import React, { useState, useEffect } from "react";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
};

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  projectId: number;
  assignee_id?: number;
  assignee?: User;
  project?: { id: number; name: string };
};

type Props = {
  defects: Defect[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (defect: Defect) => void; // теперь возвращаем объект, а не id
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

export default function SelectDefectModal({ defects, isOpen, onClose, onSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDefects = defects.filter(
    (defect) =>
      defect.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      defect.status === "new"
  );

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Выберите дефект для назначения исполнителя</h3>

        {/* Поле поиска */}
        <input
          type="text"
          placeholder="Поиск по названию дефекта..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />

        {/* Список дефектов */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredDefects.length === 0 ? (
            <p className="text-gray-600 text-center">Нет дефектов, соответствующих поиску</p>
          ) : (
            filteredDefects.map((defect) => (
              <div
                key={defect.id}
                onClick={() => {
                  onSelect(defect); // ✅ передаём весь объект
                  onClose();
                }}
                className="p-3 hover:bg-[#F0F0F0] cursor-pointer transition rounded"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className="font-medium text-black">{defect.title}</p>
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
                    Приоритет: {PRIORITY_LABELS[defect.priority]}
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
                    Статус: {STATUS_LABELS[defect.status]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
