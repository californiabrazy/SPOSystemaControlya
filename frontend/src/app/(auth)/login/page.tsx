"use client";

import React, { useState } from "react";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";


interface LoginData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter(); 
  const [form, setForm] = useState<LoginData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка входа");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user))
      setForm({ email: "", password: "" });

      router.push("/")

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F9FA] p-6">
      <div className="flex items-center mb-3 gap-2">
        <div className="w-14 h-14 bg-[#99CDD8] rounded-3xl flex items-center justify-center shadow-md">
          <Building2 className="w-8 h-8 text-[#657166]" />
        </div>
        <div className="text-center mt-2">
          <h1 className="text-2xl font-bold text-[#657166]">СистемаКонтроля</h1>
          <p className="text-sm text-[#8A9D67]">Управление дефектами</p>
        </div>
      </div>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold text-[#657166] text-center">Вход</h1>
        <p className="text-center text-[#8A9D67] mb-6">Добро пожаловать в СистемаКонтроля!</p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Пароль"
            className="w-full rounded-xl bg-[#F5F5F5] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-[#99CDD8] px-4 py-3 text-[#657166] hover:bg-[#8BBCC6] transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}