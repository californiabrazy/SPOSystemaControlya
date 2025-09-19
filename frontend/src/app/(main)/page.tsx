"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { useRouter } from "next/navigation";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export default function Home() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkToken = async () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = getCookie("refresh_token"); 

      if (!accessToken || !refreshToken) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/check_token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user?.first_name) {
              setFirstName(user.first_name);
            }
          }
          return;
        }

        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshRes.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          document.cookie =
            "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          router.push("/login");
          return;
        }

        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access_token);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.first_name) {
            setFirstName(user.first_name);
          }
        }
      } catch (err) {
        console.error("Ошибка проверки токена:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        document.cookie =
          "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
      }
    };

    checkToken();
  }, [API_URL, router]);

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-[#F0F9FA]">
          {firstName ? (
            <h1 className="text-2xl font-bold">Добрый день, {firstName}!</h1>
          ) : (
            <h1 className="text-2xl font-bold">Добрый день!</h1>
          )}
        </main>
      </div>
    </div>
  );
}
