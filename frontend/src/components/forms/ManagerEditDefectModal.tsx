"use client";

import { useEffect, useState } from "react";

type Defect = {
  id: number;
  title: string;
  status: string;
  assignee?: string;
};

type Props = {
  defect: Defect | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updated: { status?: string; assignee?: string }) => void;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Новый" },
  { value: "in_progress", label: "В работе" },
  { value: "resolved", label: "Решён" },
  { value: "closed", label: "Закрыт" },
];

export default function DefectEditModal({ defect, isOpen, onClose, onSave }: Props) {
  const [assignee, setAssignee] = useState(defect?.assignee || "");
  const [status, setStatus] = useState(defect?.status || "new");

  useEffect(() => {
    if (defect) {
      setAssignee(defect.assignee || "");
      setStatus(defect.status);
    }
  }, [defect]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !defect) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Редактировать дефект</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="ml-1 mb-1">Название дефекта</p>
            <input
              type="text"
              value={defect.title}
              disabled
              className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            />
          </div>

          <div>
            <p className="ml-1 mb-1">Исполнитель</p>
            <input
              type="text"
              placeholder="Введите исполнителя"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            />
          </div>

          <div className="col-span-2">
            <p className="ml-1 mb-1">Статус</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-[48px] rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-2">
          <button
            className="px-6 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white disabled:opacity-50"
            onClick={() => { onSave(defect.id, { assignee, status }); onClose(); }}
          >
            Сохранить
          </button>
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
