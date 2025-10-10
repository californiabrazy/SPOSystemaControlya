"use client";

import { useState } from "react";

type Defect = {
    id: number;
    title: string;
};

type Props = {
    defect: Defect;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ReportModal({ defect, isOpen, onClose, onSave }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    for (const file of files) {
        formData.append("attachments", file);
    }

    try {
        const res = await fetch(`${API_URL}/api/reports/add/assignee/${defect.id}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
        });
        if (!res.ok) throw new Error("Ошибка при создании отчёта");
        onSave();
    } catch (err) {
        console.error(err);
        alert("Не удалось создать отчёт");
    } finally {
        setLoading(false);
    }
    };

    return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-[700px] shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black mb-4">Создать отчёт для дефекта</h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
            <p className="ml-1 mb-1">Название дефекта</p>
            <input
                type="text"
                value={defect.title}
                disabled
                className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black"
            />
            </div>
            <div>
            <p className="ml-1 mb-1">Название отчёта</p>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black"
            />
            </div>
            <div className="col-span-2">
            <p className="ml-1 mb-1">Описание</p>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black"
                rows={4}
            />
            </div>
            <div className="col-span-2">
            <p className="ml-1 mb-1">Вложения</p>
            <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="w-full"
            />
            </div>
        </div>
        <div className="flex justify-center gap-2 mt-2">
            <button
            className="px-6 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading || !title || !description}
            >
            Отправить
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