"use client";

import { useState, ChangeEvent, useEffect } from "react";

interface AddDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  projects: { id: number; name: string }[];
}

export default function AddDefectModal({ isOpen, onClose, onSubmit, projects }: AddDefectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_CHARS = 200;

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setDescription(e.target.value);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (!title) return alert("Введите название дефекта");
    if (!projectId) return alert("Выберите проект");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("project_id", projectId);

    attachments.forEach((file) => formData.append("attachments", file));

    onSubmit(formData);

    // Сбрасываем форму
    setTitle("");
    setDescription("");
    setPriority("low");
    setProjectId("");
    setAttachments([]);
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Добавить дефект</h3>

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
            <p className="ml-1 mb-1">Проект</p>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-[48px] rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              <option value="" disabled>Выберите проект</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id.toString()}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="ml-1 mb-1">Приоритет</p>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-[48px] rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
            >
              <option value="" disabled>Выберите приоритет</option>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="critical">Критический</option>
            </select>
          </div>

          <div>
  <p className="ml-1 mb-1">Вложения</p>
  <label className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black cursor-pointer flex justify-between items-center shadow-md">
    {attachments.length > 0
      ? `${attachments.length} файл(ов) выбрано`
      : "Выберите файлы"}
    <input
      type="file"
      multiple
      onChange={handleFileChange}
      className="hidden"
    />
  </label>

  {attachments.length > 0 && (
    <ul className="mt-1 text-sm text-gray-700">
      {attachments.map((file, idx) => (
        <li key={idx}>{file.name}</li>
      ))}
    </ul>
  )}
</div>


          <div className="col-span-2">
            <p className="ml-1 mb-1">Описание</p>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              className="w-full h-24 rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md resize-none"
              rows={5}
            />
            <div className="text-right text-sm text-gray-500 select-none mt-1">
              {description.length} / {MAX_CHARS} символов
            </div>
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
