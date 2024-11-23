'use client'

import React, { useState, useEffect } from 'react';
import { Menu, Ticket as TicketIcon, ClipboardCheck, ArrowLeftRight, Users, CheckCircle, XCircle, X, Search } from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import api from '../api';
import { useAuth } from '../context/AuthContext';
import DistrictSidebar from './district/DistrictSidebar';
import DistrictTicketList from './district/DistrictTicketList';
import DistrictTransferList from './district/DistrictTransferList';
import DistrictCegidUserList from './district/DistrictCegidUserList';
import DistrictStatistics from './district/DistrictStatistics';
import { TabType } from './store/types';
import Navbar from './Navbar';

// Ajout des interfaces
interface Ticket {
  _id: string;
  code: string;
  caissier: string;
  type: 'delete' | 'modify';
  status: string;
  store: {
    name: string;
  };
  cause?: string;
  oldPaymentMethod?: string;
  newPaymentMethod?: string;
  oldPaymentMethod2?: string;
  newPaymentMethod2?: string;
  amount?: number;
  image?: string;
  createdAt: string;
  dateTicket: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function DistrictDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [districtTransfers, setDistrictTransfers] = useState([]);
  const [cegidUsers, setCegidUsers] = useState([]);
  const [cegidUserSearchTerm, setCegidUserSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage, setTicketsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [cachedTickets, setCachedTickets] = useState<{[key: string]: Ticket[]}>({});
  const [currentTransferPage, setCurrentTransferPage] = useState(1);
  const [transfersPerPage, setTransfersPerPage] = useState(10);
  const [totalTransferPages, setTotalTransferPages] = useState(1);
  const [currentCegidUserPage, setCurrentCegidUserPage] = useState(1);
  const [cegidUsersPerPage, setCegidUsersPerPage] = useState(10);
  const [totalCegidUserPages, setTotalCegidUserPages] = useState(1);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'pending'>('newest');
  const [transferSearchTerm, setTransferSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCegidUserFormOpen, setIsCegidUserFormOpen] = useState(false);
  const [cegidUserSortOption, setCegidUserSortOption] = useState<'newest' | 'oldest' | 'pending'>('newest');

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchDistrictTransfers();
      fetchCegidUsers();
    }
  }, [user]);

  useEffect(() => {
    const filteredTickets = tickets.filter(ticket =>
      ticket.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.caissier.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTotalPages(Math.ceil(filteredTickets.length / ticketsPerPage));
  }, [tickets, searchTerm, ticketsPerPage]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets/district');
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        console.error('Format de données inattendu:', response.data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      setError("Erreur lors de la récupération des tickets");
      setTickets([]);
    }
  };

  const fetchDistrictTransfers = async () => {
    try {
      const response = await api.get('/transfers/district');
      setDistrictTransfers(response.data);
      // Mettre à jour le nombre total de pages
      setTotalTransferPages(Math.ceil(response.data.length / transfersPerPage));
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts:', error);
      setError("Erreur lors de la récupération des transferts");
    }
  };

  // Ajouter un useEffect pour mettre à jour le nombre total de pages quand transfersPerPage change
  useEffect(() => {
    if (districtTransfers.length > 0) {
      setTotalTransferPages(Math.ceil(districtTransfers.length / transfersPerPage));
    }
  }, [districtTransfers, transfersPerPage]);

  const fetchCegidUsers = async () => {
    try {
      const response = await api.get('/cegid-users/district');
      setCegidUsers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs CEGID:', error);
      setError("Erreur lors de la récupération des utilisateurs CEGID");
    }
  };

  const handleValidateTicket = async (ticketId: string) => {
    try {
      // Trouver le ticket dans la liste
      const ticket = tickets.find(t => t._id === ticketId);
      if (!ticket) {
        throw new Error("Ticket non trouvé");
      }

      // Envoyer la requête avec la date du ticket
      const response = await api.put(`/tickets/${ticketId}/validate`, {
        status: 'approved',
        dateTicket: ticket.dateTicket // Ajouter la date du ticket
      });

      // Mettre à jour la liste des tickets
      setTickets(prevTickets =>
        prevTickets.map(t =>
          t._id === ticketId ? { ...t, status: 'approved' } : t
        )
      );

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation du ticket:', error);
      throw error;
    }
  };

  const handleRejectTicket = async (ticketId: string) => {
    try {
      await api.put(`/tickets/${ticketId}/reject`);
      fetchTickets(currentPage); // Passer la page courante
    } catch (error) {
      setError("Erreur lors du rejet du ticket");
    }
  };

  const handleValidateTransfer = async (transferId: string) => {
    try {
      await api.put(`/transfers/${transferId}/validate`);
      fetchDistrictTransfers();
    } catch (error) {
      setError("Erreur lors de la validation du transfert");
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    try {
      await api.put(`/transfers/${transferId}/reject`);
      fetchDistrictTransfers();
    } catch (error) {
      setError("Erreur lors du rejet du transfert");
    }
  };

  const handleValidateCegidUser = async (userId: string) => {
    try {
      await api.put(`/cegid-users/${userId}/validate`);
      fetchCegidUsers();
    } catch (error) {
      setError("Erreur lors de la validation de l'utilisateur");
    }
  };

  const handleRejectCegidUser = async (userId: string) => {
    try {
      await api.put(`/cegid-users/${userId}/reject`);
      fetchCegidUsers();
    } catch (error) {
      setError("Erreur lors du rejet de l'utilisateur");
    }
  };

  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsOpen(true);
  };

  // Modification du composant StatCard pour correspondre au style du StoreDashboard
  function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
      <div className={`
        bg-white 
        rounded-xl 
        shadow-sm 
        hover:shadow-lg 
        transition-all 
        duration-300 
        p-6 
        relative 
        overflow-hidden
        group
      `}>
        <div className="flex items-start justify-between">
          <div className="relative z-10">
            <p className="text-gray-600 text-base font-medium mb-2">{title}</p>
            <p className={`text-4xl font-bold text-${color}-600`}>{value}</p>
          </div>
          <div className={`
            bg-${color}-100/50 
            p-3 
            rounded-xl 
            group-hover:scale-110 
            transition-transform 
            duration-300
          `}>
            {icon}
          </div>
        </div>
      </div>
    );
  }

  // Fonction pour obtenir le titre de la page
  const getPageTitle = () => {
    switch (activeTab) {
      case 'tickets':
        return 'Validation des tickets';
      case 'transfers':
        return 'Validation des transferts';
      case 'cegidUsers':
        return 'Validation des utilisateurs CEGID';
      case 'statistics':
        return 'Statistiques';
      default:
        return 'Tableau de bord';
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Faire défiler la page vers le haut
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getPaginatedTickets = () => {
    let filtered = tickets;

    // Appliquer le tri
    switch (sortOption) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'pending':
        filtered = filtered.filter(ticket => ticket.status === 'pending');
        break;
    }

    // Appliquer la recherche
    filtered = filtered.filter(ticket =>
      ticket.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.caissier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculer le nombre total de pages
    setTotalPages(Math.ceil(filtered.length / ticketsPerPage));

    // Retourner les tickets paginés
    const startIndex = (currentPage - 1) * ticketsPerPage;
    const endIndex = startIndex + ticketsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const renderCegidUserStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Utilisateurs en attente"
          value={cegidUsers.filter((u: any) => u.status === 'pending').length}
          icon={<Users className="w-8 h-8 text-orange-500" />}
          color="orange"
        />
        <StatCard
          title="Utilisateurs validés"
          value={cegidUsers.filter((u: any) => u.status === 'completed').length}
          icon={<CheckCircle className="w-8 h-8 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Utilisateurs traités"
          value={cegidUsers.filter((u: any) => u.status === 'validated_and_processed').length}
          icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
          color="blue"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 pt-16">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <DistrictSidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      <main className="flex-1 px-4 lg:px-8 pb-8 pt-4 overflow-auto" id="main-content">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 flex-col lg:flex-row gap-4 lg:gap-0">
            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <div className="h-12 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
              <div className="text-left w-full lg:w-auto">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-800 tracking-tight">
                  {getPageTitle()}
                  <div className="mt-1 text-xs lg:text-sm font-medium text-gray-500">
                    {user?.username ? `Connecté en tant que ${user.username}` : 'Non connecté'}
                  </div>
                </h1>
              </div>
            </div>
            <div className="hidden lg:flex h-9 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-lg items-center justify-center text-white font-semibold shadow-sm px-4">
              <span className="text-sm">HA {user?.username?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p className="font-bold">Erreur</p>
              <p>{error}</p>
            </div>
          )}

          {activeTab === 'tickets' && (
            <>
              {/* Statistiques des tickets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Tickets à valider"
                  value={tickets?.filter(t => t.status === 'pending')?.length || 0}
                  icon={<TicketIcon className="w-8 h-8 text-orange-500" />}
                  color="orange"
                />
                <StatCard
                  title="Tickets validés"
                  value={tickets?.filter(t => t.status === 'approved')?.length || 0}
                  icon={<CheckCircle className="w-8 h-8 text-green-500" />}
                  color="green"
                />
                <StatCard
                  title="Validés et traités"
                  value={tickets?.filter(t => t.status === 'validated_and_processed')?.length || 0}
                  icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
                  color="blue"
                />
              </div>

              <DistrictTicketList
                tickets={tickets}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleValidateTicket={handleValidateTicket}
                handleRejectTicket={handleRejectTicket}
                openLightbox={openLightbox}
                currentPage={currentPage}
                ticketsPerPage={ticketsPerPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                setTicketsPerPage={setTicketsPerPage}
                sortOption={sortOption}
                setSortOption={setSortOption}
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
              />
            </>
          )}

          {activeTab === 'transfers' && (
            <>
              {/* Statistiques des transferts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Transferts en attente"
                  value={districtTransfers.filter((t: any) => t.status === 'pending').length}
                  icon={<ArrowLeftRight className="w-8 h-8 text-orange-500" />}
                  color="orange"
                />
                <StatCard
                  title="Transferts validés"
                  value={districtTransfers.filter((t: any) => t.status === 'completed').length}
                  icon={<CheckCircle className="w-8 h-8 text-green-500" />}
                  color="green"
                />
                <StatCard
                  title="Transferts traités"
                  value={districtTransfers.filter((t: any) => t.status === 'validated_and_processed').length}
                  icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
                  color="blue"
                />
              </div>

              <DistrictTransferList
                transfers={districtTransfers}
                handleValidateTransfer={handleValidateTransfer}
                handleRejectTransfer={handleRejectTransfer}
                searchTerm={transferSearchTerm}
                setSearchTerm={setTransferSearchTerm}
                currentPage={currentTransferPage}
                transfersPerPage={transfersPerPage}
                setCurrentPage={setCurrentTransferPage}
                totalPages={totalTransferPages}
                setTransfersPerPage={setTransfersPerPage}
              />
            </>
          )}

          {activeTab === 'cegidUsers' && (
            <>
              {renderCegidUserStats()}
              
              {/* Utiliser DistrictCegidUserList avec le style de cartes */}
              <DistrictCegidUserList
                users={cegidUsers}
                handleValidateUser={handleValidateCegidUser}
                handleRejectUser={handleRejectCegidUser}
                searchTerm={cegidUserSearchTerm}
                setSearchTerm={setCegidUserSearchTerm}
                currentPage={currentCegidUserPage}
                usersPerPage={cegidUsersPerPage}
                setCurrentPage={setCurrentCegidUserPage}
                totalPages={totalCegidUserPages}
                setUsersPerPage={setCegidUsersPerPage}
                sortOption={cegidUserSortOption}
                setSortOption={setCegidUserSortOption}
              />
            </>
          )}

          {activeTab === 'statistics' && (
            <DistrictStatistics />
          )}
        </div>
      </main>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src: currentImage }]}
      />
    </div>
  );
}
