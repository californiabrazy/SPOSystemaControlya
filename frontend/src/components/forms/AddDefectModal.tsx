"use client";

import { useState, ChangeEvent, useEffect } from "react";

interface AddDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (defectData: {
    title: string;
    description: string;
    priority: string;
    projectId: number;
  }) => void;
  projects: { id: number; name: string }[];
}

export default function AddDefectModal({ isOpen, onClose, onSubmit, projects }: AddDefectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const MAX_CHARS = 200;

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setDescription(newText);
    }
  };

  const handleSubmit = () => {
    if (!title) {
      alert("Введите название дефекта");
      return;
    }
    if (!projectId) {
      alert("Выберите проект");
      return;
    }
    onSubmit({
      title,
      description,
      priority,
      projectId: Number(projectId),
    });
    setTitle("");
    setDescription("");
    setPriority("low");
    setProjectId("");
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
        <h3 className="text-xl font-semibold text-black mb-4">Добавить дефект</h3>

        <div className="grid gap-4">
          {/* Первая строка — только Название */}
          <div>
            <p className="ml-1 mb-1">Название дефекта</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            />
          </div>

          {/* Вторая строка — Приоритет и Проект */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="ml-1 mb-1">Приоритет</p>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
              >
                <option value="" disabled>Выберите приоритет</option>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
                <option value="critical">Критический</option>
              </select>
            </div>
            <div>
              <p className="ml-1 mb-1">Проект</p>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
              >
                <option value="" disabled>Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id.toString()}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
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
            className="px-6 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white"
            onClick={handleSubmit}
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