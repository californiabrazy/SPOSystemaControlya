"use client";

import { useState } from "react";

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

interface SelectDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (defectId: number) => void;
  defects: Defect[];
}

export default function SelectDefectModal({ isOpen, onClose, onSelect, defects }: SelectDefectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDefects = defects.filter((defect) =>
    defect.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Выберите дефект для редактирования</h3>

        {/* Поле поиска */}
        <div>
          <input
            type="text"
            placeholder="Поиск по названию дефекта..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>

        {/* Список дефектов */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredDefects.length === 0 ? (
            <p className="text-[#657166] text-center">Нет дефектов, соответствующих поиску</p>
          ) : (
            filteredDefects.map((defect) => (
              <div
                key={defect.id}
                onClick={() => {
                  onSelect(defect.id);
                  onClose();
                }}
                className="p-3 border-gray-200 hover:bg-[#F0F0F0] cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium text-black">{defect.title}</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      defect.priority === "critical"
                        ? "bg-[#F3B2AA]"
                        : defect.priority === "high"
                        ? "bg-[#F3C3B2]"
                        : defect.priority === "medium"
                        ? "bg-[#F3D1B2]"
                        : "bg-[#F3E0B2]"
                    } text-black`}
                  >
                    Приоритет: {defect.priority}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
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
                    Статус: {defect.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Кнопка закрытия */}
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