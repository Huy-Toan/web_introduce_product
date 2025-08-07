import React from 'react';
import { Home, BookOpen, Users, Settings } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home },
  { id: 'books', label: 'Sách', icon: BookOpen },
  { id: 'users', label: 'Người dùng', icon: Users },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const SidebarNav = ({ activeTab, setActiveTab }) => (
  <div className="w-64 bg-white shadow-lg">
    <div className="p-6 border-b">
      <h1 className="text-xl font-bold text-gray-800">Books Admin</h1>
    </div>
    <nav className="mt-6">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
            activeTab === id
              ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Icon size={20} className="mr-3" />
          {label}
        </button>
      ))}
    </nav>
  </div>
);

export default SidebarNav;