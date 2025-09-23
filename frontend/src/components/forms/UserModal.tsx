"use client";

import { useState, useEffect } from "react";

interface Role {
  id: number;
  name: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  onSubmit: (data: {
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    password: string;
    role_id: number;
  }) => void;
}

export default function UserModal({ isOpen, onClose, roles, onSubmit }: UserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");

  useEffect(() => {
    if (!isOpen) {
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRoleId("");
    }
  }, [isOpen]);

  const parseFullName = (
    nameString: string
  ): { first_name: string; last_name: string; middle_name: string } | null => {
    const parts = nameString
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);

    if (parts.length !== 3) {
      return null;
    }

    const [last_name, first_name, middle_name] = parts;
    return { first_name, last_name, middle_name };
  };

  const handleSubmit = () => {
    const parsed = parseFullName(fullName);

    if (
      !parsed ||
      !email ||
      !password ||
      !confirmPassword ||
      !roleId ||
      password !== confirmPassword
    ) {
      alert("Введите ФИО полностью (Фамилия Имя Отчество) и заполните все поля");
      return;
    }

    onSubmit({
      ...parsed,
      email,
      password,
      role_id: Number(roleId),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">Добавить пользователя</h3>

        <div>
          <p className="ml-3">ФИО (через пробел)</p>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div>
          <p className="ml-3">Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="required w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div>
          <p className="ml-3">Пароль</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <div>
          <p className="ml-3">Повторить пароль</p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />
        </div>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
          className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        >
          <option value="">Выберите роль</option>
          {roles
            .filter((role) => role.name.toLowerCase() !== "Админ") 
            .map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
        </select>

        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded bg-[#8BBCC6] hover:bg-[#99CDD8] text-white"
            onClick={handleSubmit}
            disabled={!fullName || !email || !password || !confirmPassword || password !== confirmPassword || !roleId}
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