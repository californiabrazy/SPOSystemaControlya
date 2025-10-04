"use client";

import { useState, useEffect } from "react";

type Defect = {
  id: number;
  title: string;
  description: string;
  priority: string;
  attachments?: string[]; // теперь опционально
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
  onSubmit: (id: number, formData: FormData) => void;
  projects: Project[];
  defects: Defect[];
  selectedDefectId: number | null;
}

const MAX_CHARS = 200;

export default function EditDefectModal({
  isOpen,
  onClose,
  onSubmit,
  projects,
  defects,
  selectedDefectId,
}: EditDefectModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const defect = selectedDefectId ? defects.find((d) => d.id === selectedDefectId) : null;
  const defectAttachments = defect?.attachments || []; // безопасный доступ

  useEffect(() => {
    if (isOpen && defect) {
      setTitle(defect.title);
      setPriority(defect.priority);
      setDescription(defect.description);
      setAttachments([]); // новые файлы
    } else if (isOpen) {
      setTitle("");
      setPriority("low");
      setDescription("");
      setAttachments([]);
    }
  }, [isOpen, defect]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setDescription(e.target.value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachments(Array.from(e.target.files));
  };

  const handleSubmit = () => {
    if (!selectedDefectId) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("priority", priority);
    formData.append("description", description);

    attachments.forEach((file) => formData.append("attachments", file));

    onSubmit(selectedDefectId, formData);
    onClose();
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
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

        <div>
          <p className="ml-1 mb-1">Добавить файлы</p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>

        {defectAttachments.length > 0 && (
          <div className="mt-2">
            <p className="ml-1 mb-1">Вложенные файлы:</p>
            <ul className="list-disc ml-5">
              {defectAttachments.map((file, idx) => (
                <li key={idx}>
                  <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mt-2">
            <p className="ml-1 mb-1">Выбранные файлы:</p>
            <ul className="list-disc ml-5">
              {attachments.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

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
