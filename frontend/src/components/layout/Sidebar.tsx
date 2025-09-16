import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Folder, AlertTriangle, BarChart, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white text-[#657166] p-6 shadow-md">
      <div className="text-2xl font-bold flex justify-center text-[#8A9D67] mb-8">СистемаКонтроля</div>
      <nav className="space-y-2">
        <Link href="/dashboard" className="flex items-center space-x-2 p-2 hover:bg-[#99CDD8] hover:text-[#657166] rounded transition-colors">
          <LayoutDashboard size={20} />
          <span>Дашборд</span>
        </Link>
        <Link href="/projects" className="flex items-center space-x-2 p-2 hover:bg-[#99CDD8] hover:text-[#657166] rounded transition-colors">
          <Folder size={20} />
          <span>Проекты</span>
        </Link>
        <Link href="/defects" className="flex items-center space-x-2 p-2 hover:bg-[#99CDD8] hover:text-[#657166] rounded transition-colors">
          <AlertTriangle size={20} />
          <span>Дефекты</span>
        </Link>
        <Link href="/reports" className="flex items-center space-x-2 p-2 hover:bg-[#99CDD8] hover:text-[#657166] rounded transition-colors">
          <BarChart size={20} />
          <span>Отчеты</span>
        </Link>
        <Link href="/settings" className="flex items-center space-x-2 p-2 hover:bg-[#99CDD8] hover:text-[#657166] rounded transition-colors">
          <Settings size={20} />
          <span>Настройки</span>
        </Link>
      </nav>
    </aside>
  );
}