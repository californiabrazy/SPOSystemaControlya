"use client";

import React, { useState, ChangeEvent } from "react";

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

const AddReportModal: React.FC<AddReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const MAX_CHARS = 200;

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setDescription(newText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Заполните заголовок");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    onSubmit(formData);

    // Очистка формы
    setTitle("");
    setDescription("");
    setFiles(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-black">Создать отчет</h2>

        <div>
          <p className="ml-3">Заголовок</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            required
          />
        </div>

        <div className="relative">
          <p className="ml-3">Описание</p>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full h-44 rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md resize-none"
            rows={5}
          />
          <div className="absolute bottom-2 right-3 text-sm text-gray-500 select-none">
            {description.length} / {MAX_CHARS} символов
          </div>
        </div>

        <div>
          <p className="ml-3">Файлы</p>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>

        <div className="flex justify-center gap-2">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white"
          >
            Создать
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReportModal;
