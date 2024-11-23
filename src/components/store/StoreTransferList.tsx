import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  X
} from 'lucide-react';
import { Transfer, TransferSortOption } from './types';

// Fonction utilitaire pour la pagination
const generatePageNumbers = (currentPage: number, totalPages: number) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

// Ajouter la fonction formatDate
const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy', { locale: fr });
    }
    return 'Date invalide';
  } catch (error) {
    return 'Date invalide';
  }
};

interface StoreTransferListProps {
  transfers: Transfer[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentPage: number;
  transfersPerPage: number;
  handleCancelTransfer: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTransfersPerPage: (perPage: number) => void;
  sortOption: TransferSortOption;
  setSortOption: (option: TransferSortOption) => void;
}

export default function StoreTransferList({
  transfers,
  searchTerm,
  setSearchTerm,
  currentPage,
  transfersPerPage,
  handleCancelTransfer,
  setCurrentPage,
  totalPages,
  setTransfersPerPage,
  sortOption,
  setSortOption
}: StoreTransferListProps) {
  const filteredTransfers = transfers.filter(transfer =>
    transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTransferStatus = (status: string) => {
    const statusConfig = {
      completed: {
        text: 'Validé',
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'text-green-600'
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
        text: 'En cours',
        icon: <Clock className="w-4 h-4" />,
        className: 'text-orange-600'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 ${config.className}`}>
          {config.icon}
          <span className="font-medium text-sm">
            {config.text}
          </span>
        </div>
      </div>
    );
  };

  // Fonction pour trier les transferts
  const getSortedAndPaginatedTransfers = () => {
    let filtered = transfers.filter(transfer =>
      transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'completed':
        filtered = filtered.filter(t => t.status === 'completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(t => t.status === 'cancelled');
        break;
    }

    const startIndex = (currentPage - 1) * transfersPerPage;
    const endIndex = startIndex + transfersPerPage;
    return filtered.slice(startIndex, endIndex);
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
                onClick={() => setSortOption('completed')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'completed'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Validés</span>
                <span className="hidden lg:inline">Validés</span>
              </button>
              <button
                onClick={() => setSortOption('cancelled')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'cancelled'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Annulés</span>
                <span className="hidden lg:inline">Annulés</span>
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
            placeholder="Rechercher un transfert..."
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
        {getSortedAndPaginatedTransfers().map((transfer, index) => (
          <div 
            key={transfer._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="space-y-4">
                {/* En-tête avec numéro et statut */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Numéro</p>
                    <p className="font-medium">{transfer.transferNumber}</p>
                  </div>
                  <div>
                    {renderTransferStatus(transfer.status)}
                  </div>
                </div>

                {/* Informations en 2 colonnes */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Colonne gauche */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{transfer.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(transfer.date)}</p>
                    </div>
                  </div>

                  {/* Colonne droite - Aligné à droite */}
                  <div className="space-y-4">
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500 w-full text-right">Quantité</p>
                      <p className="font-medium w-full text-right">{transfer.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500 w-full text-right">Créé le</p>
                      <p className="font-medium w-full text-right">
                        {transfer.createdAt ? format(new Date(transfer.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Date invalide'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  {transfer.status === 'pending' && (
                    <button
                      onClick={() => handleCancelTransfer(transfer._id)}
                      className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
                      title="Annuler le transfert"
                    >
                      <Trash2 className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-xl">
        {/* Information sur les résultats */}
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200/50 backdrop-blur-xl">
            <span className="text-sm text-gray-500">Total</span>
            <span className="mx-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {filteredTransfers.length}
            </span>
            <span className="text-sm text-gray-500">transferts</span>
          </div>

          <select
            value={transfersPerPage}
            onChange={(e) => {
              setCurrentPage(1);
              setTransfersPerPage(Number(e.target.value));
            }}
            className="bg-white px-4 py-2.5 rounded-xl border border-gray-200/50 text-sm text-gray-700 shadow-sm hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200"
          >
            {[5, 10, 25, 50].map(value => (
              <option key={value} value={value}>{value} par page</option>
            ))}
          </select>
        </div>

        {/* Contrôles de pagination */}
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
              {generatePageNumbers(currentPage, totalPages).map((pageNum, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                  disabled={pageNum === '...'}
                  className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    pageNum === currentPage
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                      : pageNum === '...'
                      ? 'text-gray-400 cursor-default'
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
