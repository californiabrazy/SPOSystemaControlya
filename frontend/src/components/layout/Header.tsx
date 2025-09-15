import React from 'react';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск..."
            className="w-full p-2 pl-10 rounded bg-[#F5F5F5] text-[#657166] placeholder-[#CFD6C4] focus:outline-none focus:ring-2 focus:ring-[#99CDD8] shadow-md"
          />
          <Search className="absolute left-3 top-2.5 text-[#8A9D67]" size={20} />
        </div>
      </div>
    </header>
  );
}