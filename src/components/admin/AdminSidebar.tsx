import React from 'react';
import { Store, Package2, Users, Archive as ArchiveIcon, Receipt as ReceiptIcon, ArrowLeftRight as ArrowLeftRightIcon, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { TabType } from '../AdminDashboard';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function AdminSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100%-4rem)] bg-gradient-to-b from-orange-500 to-orange-600 text-white transition-all duration-300 z-40
        ${isCollapsed ? 'w-[4.5rem]' : 'w-64'} 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* En-tête avec titre et bouton de collapse */}
      <div className={`px-4 py-4 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center border-b border-orange-400/30`}>
        <h2 className={`text-xl font-bold text-white ${isCollapsed ? 'hidden' : 'block'}`}>
          Menu Admin
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

      <nav className="mt-2">
        {[
          { id: 'users', icon: Users, label: 'Utilisateurs' },
          { id: 'districts', icon: Store, label: 'Districts' },
          { id: 'tickets', icon: Package2, label: 'Tickets' },
          { id: 'archivedTickets', icon: ArchiveIcon, label: 'Archives' },
          { id: 'vouchers', icon: ReceiptIcon, label: "Bons d'achat" },
          { id: 'transfers', icon: ArrowLeftRightIcon, label: 'Transferts' },
          { id: 'cegidUsers', icon: Users, label: 'Utilisateurs CEGID' }
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
    </div>
  );
} 