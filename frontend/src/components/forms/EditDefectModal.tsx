"use client";

import { useState, useEffect } from "react";

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
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

interface EditDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, defectData: {
    title?: string;
    description?: string;
    priority?: string;
    projectId?: number;
  }) => void;
  projects: Project[];
  defects: Defect[];
  selectedDefectId: number | null;
}

const MAX_CHARS = 200;

export default function EditDefectModal({ isOpen, onClose, onSubmit, projects, defects, selectedDefectId }: EditDefectModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");
  const [status, setStatus] = useState("new");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen && selectedDefectId) {
      const defect = defects.find((d) => d.id === selectedDefectId);
      if (defect) {
        setTitle(defect.title);
        setPriority(defect.priority);
        setDescription(defect.description);
      }
    } else if (isOpen) {
      setTitle("");
      setPriority("low");
      setStatus("new");
      setDescription("");
    }
  }, [isOpen, selectedDefectId, defects]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setDescription(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (!selectedDefectId) return;
    onSubmit(selectedDefectId, {
      title,
      description,
      priority,
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // При размонтировании компонента сбросим на всякий случай
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Редактировать дефект</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="ml-1 mb-1">Название дефекта</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            />
          </div>
          <div>
            <p className="ml-1 mb-1">Приоритет</p>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-[48px] rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="critical">Критический</option>
            </select>
          </div>
        </div>

        <div>
          <p className="ml-1 mb-1">Описание</p>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full h-24 rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md resize-none"
            rows={5}
          />
          <div className="text-right text-sm text-gray-500 select-none mt-1">
            {description.length} / {MAX_CHARS} символов
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-2">
          <button
            className="px-6 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!selectedDefectId}
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