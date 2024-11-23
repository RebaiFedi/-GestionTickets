import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ImageIcon, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Eye, 
  X, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Search 
} from 'lucide-react';
import { Voucher, VoucherSortOption } from './types';

// Ajout de la fonction generatePageNumbers
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

interface StoreVoucherListProps {
  vouchers: Voucher[];
  openLightbox: (imageUrl: string) => void;
  handlePrintVoucher: (id: string) => Promise<void>;
  getImageUrl: (path?: string) => string;
  setError: (error: string | null) => void;
  voucherSearchTerm: string;
  setVoucherSearchTerm: (value: string) => void;
  currentVoucherPage: number;
  vouchersPerPage: number;
  setCurrentVoucherPage: (page: number) => void;
  totalVoucherPages: number;
  setVouchersPerPage: (perPage: number) => void;
  sortOption: VoucherSortOption;
  setSortOption: (option: VoucherSortOption) => void;
}

export default function StoreVoucherList({
  vouchers,
  openLightbox,
  handlePrintVoucher,
  getImageUrl,
  setError,
  voucherSearchTerm,
  setVoucherSearchTerm,
  currentVoucherPage,
  vouchersPerPage,
  setCurrentVoucherPage,
  totalVoucherPages,
  setVouchersPerPage,
  sortOption,
  setSortOption
}: StoreVoucherListProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Fonction pour trier et paginer les bons d'achat
  const getSortedAndPaginatedVouchers = () => {
    let filtered = vouchers.filter(voucher =>
      voucher.voucherNumber.toLowerCase().includes(voucherSearchTerm.toLowerCase())
    );

    switch (sortOption) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'pending':
        filtered = filtered.filter(v => v.status === 'pending');
        break;
      case 'validated':
        filtered = filtered.filter(v => v.status === 'validated');
        break;
      case 'rejected':
        filtered = filtered.filter(v => v.status === 'rejected');
        break;
    }

    // Vérifier si la page actuelle est valide
    const maxPage = Math.max(1, Math.ceil(filtered.length / vouchersPerPage));
    const safePage = Math.min(currentVoucherPage, maxPage);
    
    const startIndex = (safePage - 1) * vouchersPerPage;
    const endIndex = startIndex + vouchersPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  // Fonction pour obtenir le total des bons filtrés
  const getTotalFilteredVouchers = () => {
    let filtered = vouchers.filter(voucher =>
      voucher.voucherNumber.toLowerCase().includes(voucherSearchTerm.toLowerCase())
    );

    switch (sortOption) {
      case 'pending':
        filtered = filtered.filter(v => v.status === 'pending');
        break;
      case 'validated':
        filtered = filtered.filter(v => v.status === 'validated');
        break;
      case 'rejected':
        filtered = filtered.filter(v => v.status === 'rejected');
        break;
    }

    return filtered.length;
  };

  // Calculer le nombre réel de pages
  const calculatedTotalPages = Math.max(1, Math.ceil(getTotalFilteredVouchers() / vouchersPerPage));

  // Vérifier et corriger la page courante si nécessaire
  useEffect(() => {
    if (currentVoucherPage > calculatedTotalPages) {
      setCurrentVoucherPage(Math.max(1, calculatedTotalPages));
    }
  }, [calculatedTotalPages, currentVoucherPage, setCurrentVoucherPage]);

  const renderVoucherStatus = (status: string) => {
    const statusConfig = {
      validated: {
        text: 'Validé',
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'text-green-600'
      },
      not_found: {
        text: 'Non trouvé',
        icon: <AlertCircle className="w-4 h-4" />,
        className: 'text-yellow-600'
      },
      rejected: {
        text: 'Refusé',
        icon: <XCircle className="w-4 h-4" />,
        className: 'text-red-600'
      },
      pending: {
        text: 'En attente',
        icon: <Clock className="w-4 h-4" />,
        className: 'text-gray-600'
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
                onClick={() => setSortOption('rejected')}
                className={`px-3 py-2 text-base lg:text-sm rounded-lg font-medium transition-all duration-200 ${
                  sortOption === 'rejected'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                } w-full lg:w-auto`}
              >
                <span className="lg:hidden">Refusés</span>
                <span className="hidden lg:inline">Refusés</span>
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
            placeholder="Rechercher un bon d'achat..."
            value={voucherSearchTerm}
            onChange={(e) => setVoucherSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 text-gray-600 bg-white rounded-lg border-2 border-gray-100 outline-none focus:border-orange-500 transition-all duration-200 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {voucherSearchTerm && (
            <button
              onClick={() => setVoucherSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Liste de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSortedAndPaginatedVouchers().map((voucher, index) => (
          <div 
            key={voucher._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="space-y-4">
                {/* En-tête avec numéro et statut */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Numéro</p>
                    <p className="font-medium">{voucher.voucherNumber}</p>
                  </div>
                  <div>
                    {renderVoucherStatus(voucher.status)}
                  </div>
                </div>

                {/* Informations en 2 colonnes */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Colonne gauche */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium">{voucher.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{voucher.voucherType}</p>
                    </div>
                  </div>

                  {/* Colonne droite - Ajusté pour utiliser toute la largeur */}
                  <div className="space-y-4">
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500 w-full text-right">CIN</p>
                      <p className="font-medium w-full text-right">{voucher.cin}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-500 w-full text-right">Montant</p>
                      <p className="font-medium w-full text-right">{voucher.amount} TND</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">
                    {voucher.createdAt && format(new Date(voucher.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  {voucher.image && (
                    <button
                      onClick={() => openLightbox(getImageUrl(voucher.image))}
                      className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                    >
                      <ImageIcon className="w-5 h-5 text-orange-500" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedVoucher(selectedVoucher === voucher ? null : voucher)}
                    className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
                  >
                    <Eye className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                  </button>
                  {voucher.status === 'validated' && (
                    <button
                      onClick={() => handlePrintVoucher(voucher._id)}
                      className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
                    >
                      <Printer className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup de détails */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 lg:p-4">
          <div className="bg-white w-full h-full lg:h-auto lg:w-[600px] rounded-none lg:rounded-xl shadow-2xl overflow-y-auto">
            <div className="px-3 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Détails du bon d'achat</h3>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations personnelles */}
              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedVoucher.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-lg font-medium text-gray-900">{selectedVoucher.fullName}</p>
                  <p className="text-sm text-gray-500 mt-1">CIN: {selectedVoucher.cin}</p>
                </div>
              </div>

              {/* Autres détails */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Numéro du bon</p>
                    <p className="text-lg font-medium text-gray-900">{selectedVoucher.voucherNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-lg font-medium text-gray-900">{selectedVoucher.voucherType}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="text-lg font-medium text-gray-900">{selectedVoucher.amount} TND</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedVoucher.createdAt && format(new Date(selectedVoucher.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination avec le même style que StoreTicketList */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
        {/* Information sur les résultats avec design moderne */}
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200/50 backdrop-blur-xl">
            <span className="text-sm text-gray-500">Total</span>
            <span className="mx-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {getTotalFilteredVouchers()}
            </span>
            <span className="text-sm text-gray-500">bons d'achat</span>
          </div>

          <select
            value={vouchersPerPage}
            onChange={(e) => {
              setCurrentVoucherPage(1);
              setVouchersPerPage(Number(e.target.value));
            }}
            className="bg-white px-4 py-2.5 rounded-xl border border-gray-200/50 text-sm text-gray-700 shadow-sm hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200"
          >
            {[5, 10, 25, 50].map(value => (
              <option key={value} value={value}>{value} par page</option>
            ))}
          </select>
        </div>

        {/* Contrôles de pagination modernisés */}
        <div className="flex items-center">
          <nav className="flex items-center space-x-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-200/50">
            <button
              onClick={() => setCurrentVoucherPage(1)}
              disabled={currentVoucherPage === 1}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentVoucherPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Première page"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentVoucherPage(currentVoucherPage - 1)}
              disabled={currentVoucherPage === 1}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentVoucherPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Page précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center px-2">
              {generatePageNumbers(currentVoucherPage, totalVoucherPages).map((pageNum, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof pageNum === 'number' && setCurrentVoucherPage(pageNum)}
                  disabled={pageNum === '...'}
                  className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    pageNum === currentVoucherPage
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
              onClick={() => setCurrentVoucherPage(currentVoucherPage + 1)}
              disabled={currentVoucherPage === totalVoucherPages}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentVoucherPage === totalVoucherPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Page suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentVoucherPage(calculatedTotalPages)}
              disabled={currentVoucherPage === calculatedTotalPages}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentVoucherPage === calculatedTotalPages
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
