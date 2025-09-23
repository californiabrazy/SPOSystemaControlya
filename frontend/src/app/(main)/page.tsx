"use client";

import React, { useEffect, useState } from "react";

export default function DashboardPage() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFirstName(user?.first_name || null);
    }
  }, []);

  return (
    <div>
      {firstName ? (
        <h1 className="text-2xl font-bold">Добрый день, {firstName}!</h1>
      ) : (
        <h1 className="text-2xl font-bold">Добрый день!</h1>
      )}
    </div>
  );
}
