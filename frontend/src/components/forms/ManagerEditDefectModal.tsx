"use client";

import { useEffect, useState } from "react";

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
  status: string;
  assignee_id?: number;
  assignee?: User;
};

type Props = {
  defect: Defect | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updated: { status?: string; assignee_id?: number }) => void;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Новый" },
  { value: "in_progress", label: "В работе" },
  { value: "resolved", label: "Решён" },
  { value: "closed", label: "Закрыт" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function DefectEditModal({ defect, isOpen, onClose, onSave }: Props) {
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [assignees, setAssignees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${API_URL}/api/admin/available_assignees`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка загрузки исполнителей");
          return res.json();
        })
        .then((data: User[]) => setAssignees(data))
        .catch((err) => {
          console.error(err);
          alert("Не удалось загрузить список исполнителей");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (defect) {
      setAssigneeId(defect.assignee_id);
      if (defect.status === "new") {
        setStatus("in_progress");
      } else {
        setStatus(defect.status);
      }
    }
  }, [defect]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !defect) return null;

  const handleSave = () => {
    if (!assigneeId || !status) {
      alert("Ошибка: Необходимо выбрать исполнителя и статус дефекта!");
      return;
    }

    onSave(defect.id, { assignee_id: assigneeId, status });
    onClose();
  };

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
            <select
              value={assigneeId ?? ""}
              onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-[48px] rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
              disabled={loading}
            >
              <option value="">Выберите исполнителя</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} {user.middle_name || ""}
                </option>
              ))}
            </select>
            {loading && <p className="text-sm text-gray-500 mt-1">Загрузка исполнителей...</p>}
          </div>

          <div className="col-span-2">
            <p className="ml-1 mb-1">Статус</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-[48px] rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              <option value="" disabled>
                Выбрать
              </option>
              {STATUS_OPTIONS.filter((s) => {
                if (defect.status === "new") return s.value === "in_progress";
                if (defect.status === "in_progress") return s.value !== "new";
                if (defect.status === "resolved") return s.value !== "new";
                if (defect.status === "closed") return s.value !== "new";
                return true;
              }).map((s) => (
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
            onClick={handleSave}
            disabled={loading}
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