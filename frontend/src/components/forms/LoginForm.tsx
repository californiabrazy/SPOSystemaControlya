"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // исправлено

interface LoginData {
  email: string;
  password: string;
}

type JwtPayload = {
  role?: string;
  exp?: number;
  [key: string]: unknown; // вместо any
};

export default function LoginForm() {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка входа");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.refresh_token) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        document.cookie = `refresh_token=${data.refresh_token}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;
      }

      setForm({ email: "", password: "" });

      const decoded = jwtDecode<JwtPayload>(data.access_token); // указываем тип дженериком
      if (decoded.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (_err: unknown) {
      setError(_err instanceof Error ? _err.message : "Произошла ошибка");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div>
        <p className="ml-3">Email</p>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
      </div>

      <div>
        <p className="ml-3">Пароль</p>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded bg-[#8BBCC6] px-4 py-3 text-white hover:bg-[#99CDD8] transition-colors"
      >
        Войти
      </button>
    </form>
  );
}
