import React from 'react';
import { Menu, X, Ticket, ClipboardCheck, ArrowLeftRight, Users } from 'lucide-react';
import { TabType } from './types';

interface MobileStoreDashboardProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pageTitle: string;
  username?: string;
}

export default function MobileStoreDashboard({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  pageTitle,
  username
}: MobileStoreDashboardProps) {
  return (
    <div className="lg:hidden">
      {/* Header Mobile */}
      <div className="fixed top-16 left-0 right-0 z-20 bg-white shadow-sm">
        <div className="flex items-center justify-between p-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-sm font-bold text-gray-800 truncate px-2">
              {pageTitle}
            </h1>
          </div>
          <div className="bg-orange-500 px-2 py-0.5 rounded-lg">
            <span className="text-xs text-white font-medium">
              HA {username?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 
          w-56 bg-orange-600 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-3 pt-[4.5rem]">
          <h2 className="text-white font-bold text-base">Menu Magasin</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-full hover:bg-orange-700 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-2">
          {[
            { id: 'tickets', icon: Ticket, label: 'Tickets' },
            { id: 'vouchers', icon: ClipboardCheck, label: 'Bons d\'achat' },
            { id: 'transfers', icon: ArrowLeftRight, label: 'Transfert' },
            { id: 'cegidUsers', icon: Users, label: 'Utilisateurs CEGID' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`w-full text-left p-3 flex items-center rounded-lg transition-colors duration-200 mb-1 ${
                activeTab === id ? 'bg-orange-700 text-white' : 'text-white hover:bg-orange-500'
              }`}
              onClick={() => {
                setActiveTab(id as TabType);
                setIsSidebarOpen(false);
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="ml-3 text-sm">{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-orange-500">
          <div className="text-white">
            <p className="text-xs">Connecté en tant que :</p>
            <p className="font-bold text-sm">{username}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 