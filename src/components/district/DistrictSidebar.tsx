import React, { useState } from 'react';
import { Menu, Ticket, ClipboardCheck, ArrowLeftRight, Users, BarChart2, LogOut, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { TabType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface DistrictSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function DistrictSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab
}: DistrictSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    
    setTimeout(() => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static top-16 bottom-0 z-40 bg-orange-600 text-white transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'left-0' : '-left-64'
        } lg:left-0 ${isCollapsed ? 'lg:w-20' : 'w-64'}`}
      >
        {/* En-tête avec titre et bouton de collapse */}
        <div className={`px-4 py-4 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
          <h2 className={`text-xl font-bold text-white ${isCollapsed ? 'hidden' : 'block'}`}>
            District Panel
          </h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-orange-500/50 transition-all duration-300`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-white" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <nav className="mt-4 flex-grow">
          {[
            { id: 'tickets', icon: Ticket, label: 'Tickets' },
            { id: 'transfers', icon: ArrowLeftRight, label: 'Transfert' },
            { id: 'cegidUsers', icon: Users, label: 'Utilisateurs CEGID' },
            { id: 'statistics', icon: BarChart2, label: 'Statistiques' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`w-full text-left p-4 flex items-center transition-colors duration-200 ${
                activeTab === id ? 'bg-orange-700 text-white' : 'hover:bg-orange-500'
              } ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => handleTabClick(id as TabType)}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Bouton de déconnexion */}
        <button
          onClick={handleLogout}
          className={`p-4 flex items-center text-white hover:bg-orange-700 transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-6 h-6" />
          <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>Déconnexion</span>
        </button>
      </aside>
    </>
  );
}
