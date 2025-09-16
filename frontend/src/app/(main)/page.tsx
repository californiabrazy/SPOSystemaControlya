"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { useRouter } from "next/navigation";

export default function Home() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/check_token`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setFirstName(user.first_name || null);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    checkToken();
  }, [router]);

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
