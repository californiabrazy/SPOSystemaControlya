"use client";

import React, { useEffect } from "react";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; 
import LoginForm from "@/components/forms/LoginForm";

type JwtPayload = {
  role?: string;
  exp?: number;
  [key: string]: unknown; 
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) return;

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      if (decoded.role === "Админ") {
        router.push("/admin/users");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Ошибка декодирования токена:", err);
      localStorage.removeItem("access_token");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F9FA] p-6">
      <div className="flex items-center mb-3 gap-2">
        <div className="text-center flex justify-center p-1 font-bold mt-1 text-2xl font-bold text-[#8A9D67] border rounded border-3 cursor-pointer">
          СистемаКонтроля
        </div>
      </div>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold text-[#657166] text-center">
          Вход
        </h1>
        <p className="text-center text-[#8A9D67] mb-6">
          Добро пожаловать в СистемаКонтроля!
        </p>

        <LoginForm />
      </div>
    </div>
  );
}
