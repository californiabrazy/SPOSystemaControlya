"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";

interface LoginData {
  email: string;
  password: string;
}

type JwtPayload = {
  role?: string;
  exp?: number;
  [key: string]: unknown;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!; 

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginData>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка входа");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setForm({ email: "", password: "" });

      const decoded = jwtDecode<JwtPayload>(data.access_token);
      if (decoded.role === "Админ") {
        router.push("/admin/users");
      } else if (decoded.role === "Инженер") {
        router.push("/defects/engineer")
      } else if (decoded.role === "Исполнитель") {
        router.push("/reports/assignee")
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
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className="w-full rounded bg-[#F0F0F0] px-4 py-3 text-black placeholder-black outline-none focus:ring-2 focus:ring-[#99CDD8] border-none shadow-md pr-10"
          />
          <button
            type="button"
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
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
