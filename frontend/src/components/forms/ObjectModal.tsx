"use client";

import { useState, ChangeEvent } from "react";

interface Manager {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
}

interface ObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  onSubmit: (data: { name: string; manager_id: number; description: string }) => void;
}

export default function ObjectModal({ isOpen, onClose, managers, onSubmit }: ObjectModalProps) {
  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [description, setDescription] = useState("");
  const MAX_CHARS = 200;

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setDescription(newText);
    }
  };

  const handleSubmit = () => {
    if (!name || !managerId) {
      alert("Заполните все обязательные поля");
      return;
    }
    onSubmit({
      name,
      manager_id: parseInt(managerId, 10),
      description,
    });
    setName("");
    setManagerId("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">Добавить объект</h3>
        <div>
          <p className="ml-3">Название объекта</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div>
          <p className="ml-3">Менеджер</p>
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          >
            <option value="" disabled>
              Выберите менеджера
            </option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.first_name} {manager.last_name} {manager.middle_name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <p className="ml-3">Описание</p>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full h-44 rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md resize-none"
            rows={5}
          />
          <div className="absolute bottom-2 right-3 text-sm text-gray-500 select-none">
            {description.length} / {MAX_CHARS} символов
          </div>
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