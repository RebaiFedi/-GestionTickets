import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ImageIcon, 
  Eye, 
  X, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search
} from 'lucide-react';
import { Ticket, TicketSortOption } from './types';

interface StoreTicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  handleCancelTicket: (id: string) => Promise<void>;
  openLightbox: (imageUrl: string) => void;
  getImageUrl: (path?: string) => string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentPage: number;
  ticketsPerPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTicketsPerPage: (perPage: number) => void;
  sortOption: TicketSortOption;
  setSortOption: (option: TicketSortOption) => void;
}

export default function StoreTicketList({
  tickets,
  selectedTicket,
  setSelectedTicket,
  handleCancelTicket,
  openLightbox,
  getImageUrl,
  searchTerm,
  setSearchTerm,
  currentPage,
  ticketsPerPage,
  setCurrentPage,
  totalPages,
  setTicketsPerPage,
  sortOption,
  setSortOption
}: StoreTicketListProps) {

  const renderTicketStatus = (status: string) => {
    const statusConfig = {
      approved: {
        text: 'Validé',
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'text-green-600'
      },
      rejected: {
        text: 'Refusé',
        icon: <XCircle className="w-4 h-4" />,
        className: 'text-red-600'
      },
      cancelled: {
        text: 'Annulé',
        icon: <XCircle className="w-4 h-4" />,
        className: 'text-red-600'
      },
      validated_and_processed: {
        text: 'Validé et traité',
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'text-blue-600'
      },
      pending: {
        text: 'En attente',
        icon: <Clock className="w-4 h-4" />,
        className: 'text-orange-600'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 ${config.className}`}>
          {config.icon}
          <span className="font-medium text-sm">{config.text}</span>
        </div>
      </div>
    );
  };

  const renderTicketType = (type: string) => {
    const typeConfig = {
      delete: {
        text: 'Suppression',
        icon: <Trash2 className="w-4 h-4" />,
        className: 'text-red-600'
      },
      modify: {
        text: 'Modification',
        icon: <Edit className="w-4 h-4" />,
        className: 'text-blue-600'
      }
    };

    const config = typeConfig[type as keyof typeof typeConfig];

    return (
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 ${config.className}`}>
          {config.icon}
          <span className="font-medium text-sm">{config.text}</span>
        </div>
      </div>
    );
  };

  const getSortedAndPaginatedTickets = () => {
    let filtered = tickets.filter(ticket =>
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.caissier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'pending':
        filtered = filtered.filter(t => t.status === 'pending');
        break;
      case 'validated':
        filtered = filtered.filter(t => t.status === 'approved');
        break;
      case 'processed':
        filtered = filtered.filter(t => t.status === 'validated_and_processed');
        break;
    }

    const startIndex = (currentPage - 1) * ticketsPerPage;
    const endIndex = startIndex + ticketsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalFilteredTickets = () => {
    return tickets.filter(ticket =>
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.caissier.toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
  };

  return (
    <div>
      {/* Section de tri - Version adaptative */}
      <div className="mb-4">
        <div className="w-full bg-white rounded-xl shadow-sm p-2">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
            <span className="text-sm text-gray-500 px-3 hidden lg:inline whitespace-nowrap">
              Trier par:
            </span>
            <div className="grid grid-cols-2 lg:flex gap-2 w-full">
              <button
                onClick={() => setSortOption('newest')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'newest'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Récents</span>
                <span className="hidden lg:inline">Plus récents</span>
              </button>
              <button
                onClick={() => setSortOption('oldest')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'oldest'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Anciens</span>
                <span className="hidden lg:inline">Plus anciens</span>
              </button>
              <button
                onClick={() => setSortOption('pending')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'pending'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Attente</span>
                <span className="hidden lg:inline">En attente</span>
              </button>
              <button
                onClick={() => setSortOption('validated')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'validated'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Validés</span>
                <span className="hidden lg:inline">Validés</span>
              </button>
              <button
                onClick={() => setSortOption('processed')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'processed'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Traités</span>
                <span className="hidden lg:inline">Validés et traités</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche séparée */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un ticket par code ou caissier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-gray-600 bg-white rounded-lg border-2 border-gray-100 outline-none focus:border-orange-500 transition-all duration-200 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Liste de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSortedAndPaginatedTickets().map((ticket, index) => (
          <div 
            key={ticket._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="space-y-4">
                {/* En-tête avec code et statut */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="font-medium">{ticket.code}</p>
                  </div>
                  <div>
                    {renderTicketStatus(ticket.status)}
                  </div>
                </div>

                {/* Informations en 2 colonnes */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Colonne gauche */}
                  <div>
                    <p className="text-sm text-gray-500">Caissier</p>
                    <p className="font-medium">{ticket.caissier}</p>
                  </div>
                  {/* Colonne droite */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="font-medium">{ticket.amount} TND</p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">
                    {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>

                {/* Footer avec type et actions */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  {/* Type à gauche */}
                  <div>
                    {renderTicketType(ticket.type)}
                  </div>
                  
                  {/* Actions à droite */}
                  <div className="flex space-x-2">
                    {ticket.image && (
                      <button
                        onClick={() => openLightbox(getImageUrl(ticket.image))}
                        className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                      >
                        <ImageIcon className="w-5 h-5 text-orange-500" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTicket(selectedTicket === ticket ? null : ticket)}
                      className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
                    >
                      <Eye className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                    </button>
                    {ticket.status === 'pending' && (
                      <button
                        onClick={() => handleCancelTicket(ticket._id)}
                        className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
                        title="Annuler le ticket"
                      >
                        <Trash2 className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal des détails du ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
          <div className="bg-white w-full h-full lg:h-auto lg:w-[600px] rounded-none lg:rounded-xl shadow-2xl overflow-y-auto">
            <div className="px-3 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Détails du ticket</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedTicket.caissier.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Caissier</p>
                  <p className="text-lg font-medium text-gray-900">{selectedTicket.caissier}</p>
                  <p className="text-sm text-gray-500 mt-1">Code: {selectedTicket.code}</p>
                </div>
              </div>

              {/* Type et Statut */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="mt-1">
                    {renderTicketType(selectedTicket.type)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Statut</p>
                  <div className="mt-1">
                    {renderTicketStatus(selectedTicket.status)}
                  </div>
                </div>
              </div>

              {/* Détails spécifiques selon le type */}
              {selectedTicket.type === 'delete' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Cause</p>
                    <p className="text-lg font-medium text-gray-900">{selectedTicket.cause}</p>
                  </div>
                  {selectedTicket.amount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="text-lg font-medium text-gray-900">{selectedTicket.amount} TND</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Ancien mode de paiement</p>
                      <p className="text-lg font-medium text-gray-900">{selectedTicket.oldPaymentMethod}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Nouveau mode de paiement</p>
                      <p className="text-lg font-medium text-gray-900">{selectedTicket.newPaymentMethod}</p>
                    </div>
                  </div>

                  {selectedTicket.oldPaymentMethod2 && selectedTicket.newPaymentMethod2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Ancien mode de paiement 2</p>
                        <p className="text-lg font-medium text-gray-900">{selectedTicket.oldPaymentMethod2}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Nouveau mode de paiement 2</p>
                        <p className="text-lg font-medium text-gray-900">{selectedTicket.newPaymentMethod2}</p>
                      </div>
                    </div>
                  )}

                  {selectedTicket.amount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Montant</p>
                      <p className="text-lg font-medium text-gray-900">{selectedTicket.amount} TND</p>
                    </div>
                  )}
                </div>
              )}

              {/* Date de création */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="text-lg font-medium text-gray-900">
                  {format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-xl">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200/50 backdrop-blur-xl">
            <span className="text-sm text-gray-500">Total</span>
            <span className="mx-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {getTotalFilteredTickets()}
            </span>
            <span className="text-sm text-gray-500">tickets</span>
          </div>

          <select
            value={ticketsPerPage}
            onChange={(e) => {
              setCurrentPage(1);
              setTicketsPerPage(Number(e.target.value));
            }}
            className="bg-white px-4 py-2.5 rounded-xl border border-gray-200/50 text-sm text-gray-700 shadow-sm hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200"
          >
            {[5, 10, 25, 50].map(value => (
              <option key={value} value={value}>{value} par page</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <nav className="flex items-center space-x-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-200/50">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Première page"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Page précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    pageNum === currentPage
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Page suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Dernière page"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
