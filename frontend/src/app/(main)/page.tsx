import React from 'react';
import Sidebar from '../../components/layout/Header';
import Header from '../../components/layout/Sidebar';

export default function Home() {
  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      <Header />
      <div className="flex-1 flex flex-col">
        <Sidebar />
        <main className="flex-1 p-6 bg-[#F5F5F5]">
          {/* Content will be added later */}
        </main>
      </div>
    </div>
  );
}