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
    second_name: string;
    email: string;
    password: string;
    role_id: number;
  }) => void;
}

export default function UserModal({ isOpen, onClose, roles, onSubmit }: UserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");

  useEffect(() => {
    if (!isOpen) {
      setFirstName("");
      setSecondName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRoleId("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!firstName || !secondName || !lastName || !email || !password || !roleId) return;
    onSubmit({
      first_name: firstName,
      second_name: secondName,
      last_name: lastName,
      email,
      password,
      role_id: Number(roleId),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h3 className="text-xl font-semibold text-black">Добавить пользователя</h3>

        <input
          type="text"
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
        <input
          type="text"
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
        <input
          type="text"
          placeholder="Отчество"
          value={secondName}
          onChange={(e) => setSecondName(e.target.value)}
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />

        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : "")}
          className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        >
          <option value="">Выберите роль</option>
          {roles
            .filter((role) => role.name.toLowerCase() !== "admin") // исключаем admin
            .map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
        </select>

        <div className="flex justify-center gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-[#657166]"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded bg-[#99CDD8] hover:bg-[#88B8C3] text-white"
            onClick={handleSubmit}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
