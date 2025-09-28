"use client";

import { useState, ChangeEvent } from "react";

interface AddDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (defectData: {
    title: string;
    description: string;
    priority: string;
    projectId: number;
    authorId: number;
  }) => void;
}

export default function AddDefectModal({ isOpen, onClose, onSubmit }: AddDefectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [projectId, setProjectId] = useState("");
  const [authorId, setAuthorId] = useState("");
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
      alert("Введите ID проекта");
      return;
    }
    if (!authorId) {
      alert("Введите ID автора");
      return;
    }
    onSubmit({
      title,
      description,
      priority,
      projectId: Number(projectId),
      authorId: Number(authorId),
    });
    setTitle("");
    setDescription("");
    setPriority("low");
    setProjectId("");
    setAuthorId("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">Добавить дефект</h3>
        <div>
          <p className="ml-3">Название дефекта</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div className="relative">
          <p className="ml-3">Описание</p>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full h-40 rounded-xl bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md resize-none"
            rows={5}
          />
          <div className="absolute bottom-2 right-3 text-sm text-gray-500 select-none">
            {description.length} / {MAX_CHARS} символов
          </div>
        </div>
        <div>
          <p className="ml-3">Приоритет</p>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
        <div>
          <p className="ml-3">ID проекта</p>
          <input
            type="number"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-xl bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div>
          <p className="ml-3">ID автора</p>
          <input
            type="number"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full rounded-xl bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white"
            onClick={handleSubmit}
          >
            Сохранить
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}