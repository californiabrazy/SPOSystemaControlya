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
      if (decoded.role === "admin") {
        router.push("/admin");
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
        <div className="w-14 h-14 bg-[#99CDD8] rounded-3xl flex items-center justify-center shadow-md">
          <Building2 className="w-8 h-8 text-[#657166]" />
        </div>
        <div className="text-center mt-1">
          <h1 className="text-2xl font-bold text-[#657166]">СистемаКонтроля</h1>
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
