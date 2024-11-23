import React, { useState, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, Eye, X, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { DistrictTransfer } from './types';
import { AnimatePresence } from 'framer-motion';
import SuccessMessage from '../store/SuccessMessage';

interface DistrictTransferListProps {
  transfers: DistrictTransfer[];
  handleValidateTransfer: (id: string) => Promise<void>;
  handleRejectTransfer: (id: string) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentPage: number;
  transfersPerPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTransfersPerPage: (value: number) => void;
}

// Ajouter le type pour les options de tri
type SortOption = 'newest' | 'oldest' | 'pending';

// Ajouter la fonction generatePageNumbers
const generatePageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined = undefined; // Initialiser l avec undefined

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l !== undefined) { // Vérifier si l est défini
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

// Ajouter le composant SearchBar
const SearchBar = ({ placeholder, value, onChange }: { 
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative w-full">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full py-3 lg:py-4 pl-10 lg:pl-12 pr-4 text-sm lg:text-base text-gray-600 bg-white rounded-lg border-2 border-gray-100 outline-none focus:border-orange-500 transition-all duration-200 shadow-sm"
    />
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
    </div>
    {value && (
      <button
        onClick={() => onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
      </button>
    )}
  </div>
);

// Ajouter la fonction renderTransferStatus
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

// Dans le composant DistrictTransferList, ajouter une vue mobile pour les transferts
const MobileTransferCard = ({ transfer, setSelectedTransfer }: { transfer: DistrictTransfer, setSelectedTransfer: (transfer: DistrictTransfer | null) => void }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-medium text-gray-900">{transfer.store.name}</h3>
        <div className="text-sm text-gray-500">Numéro: {transfer.transferNumber}</div>
      </div>
      {transfer.status === 'pending' && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleValidate(transfer._id)}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-200"
            title="Valider"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </button>
          <button
            onClick={() => handleReject(transfer._id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
            title="Refuser"
          >
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="bg-gray-50 p-2 rounded">
        <span className="text-gray-500">Quantité:</span>
        <div className="font-medium text-center">{transfer.quantity}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <span className="text-gray-500">Destination:</span>
        <div className="font-medium text-center">{transfer.destination}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <span className="text-gray-500">Statut:</span>
        <div className="font-medium text-center">{renderTransferStatus(transfer.status)}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <span className="text-gray-500">Date:</span>
        <div className="font-medium text-center">{formatDate(transfer.date)}</div>
      </div>
    </div>

    {/* Ajouter les boutons d'actions dans la version mobile */}
    <div className="mt-4 flex justify-end space-x-2">
      <button
        onClick={() => setSelectedTransfer(transfer)}
        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">Voir les détails</span>
      </button>
    </div>
  </div>
);

export default function DistrictTransferList({
  transfers,
  handleValidateTransfer,
  handleRejectTransfer,
  searchTerm,
  setSearchTerm,
  currentPage,
  transfersPerPage,
  setCurrentPage,
  totalPages,
  setTransfersPerPage,
}: DistrictTransferListProps) {
  const [selectedTransfer, setSelectedTransfer] = useState<DistrictTransfer | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  // Ajouter ces états pour les messages de succès
  const [showValidateSuccess, setShowValidateSuccess] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);

  // Fonction pour trier les transferts
  const getSortedTransfers = () => {
    let filtered = transfers.filter(transfer =>
      transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    switch (sortOption) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'pending':
        filtered = filtered.filter(transfer => transfer.status === 'pending');
        break;
    }

    return filtered;
  };

  // Calculer les résultats paginés
  const getPaginatedTransfers = () => {
    const sortedTransfers = getSortedTransfers();
    const startIndex = (currentPage - 1) * transfersPerPage;
    const endIndex = startIndex + transfersPerPage;
    return sortedTransfers.slice(startIndex, endIndex);
  };

  // Calculer le nombre total de pages basé sur les résultats filtrés
  const calculatedTotalPages = Math.ceil(getSortedTransfers().length / transfersPerPage);

  // Réinitialiser la page courante quand on change de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption]);

  // Modifier les fonctions de gestion des actions
  const handleValidate = async (transferId: string) => {
    try {
      await handleValidateTransfer(transferId);
      setShowValidateSuccess(true);
      setTimeout(() => {
        setShowValidateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const handleReject = async (transferId: string) => {
    try {
      await handleRejectTransfer(transferId);
      setShowRejectSuccess(true);
      setTimeout(() => {
        setShowRejectSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="mb-6">
        <SearchBar
          placeholder="Rechercher un transfert..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Options de tri - Version desktop (cachée sur mobile) */}
      <div className="hidden lg:block -mx-4 px-4 lg:mx-0 lg:px-0 mb-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center p-2">
            <span className="text-sm text-gray-500 px-3 min-w-fit">Trier par:</span>
            <div className="flex-1 overflow-x-auto hide-scrollbar">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOption('newest')}
                  className={`
                    min-w-fit px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200 whitespace-nowrap
                    ${sortOption === 'newest'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-orange-50'
                    }
                  `}
                >
                  Plus récents
                </button>
                <button
                  onClick={() => setSortOption('oldest')}
                  className={`
                    min-w-fit px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200 whitespace-nowrap
                    ${sortOption === 'oldest'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-orange-50'
                    }
                  `}
                >
                  Plus anciens
                </button>
                <button
                  onClick={() => setSortOption('pending')}
                  className={`
                    min-w-fit px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200 whitespace-nowrap
                    ${sortOption === 'pending'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-orange-50'
                    }
                  `}
                >
                  En attente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Options de tri - Version mobile (visible uniquement sur mobile) */}
      <div className="lg:hidden mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Trier par</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSortOption('newest')}
              className={`
                w-full px-4 py-3 rounded-xl text-sm font-medium 
                transition-all duration-200
                ${sortOption === 'newest'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-orange-50'
                }
              `}
            >
              Plus récents
            </button>
            <button
              onClick={() => setSortOption('oldest')}
              className={`
                w-full px-4 py-3 rounded-xl text-sm font-medium 
                transition-all duration-200
                ${sortOption === 'oldest'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-orange-50'
                }
              `}
            >
              Plus anciens
            </button>
            <button
              onClick={() => setSortOption('pending')}
              className={`
                w-full px-4 py-3 rounded-xl text-sm font-medium 
                transition-all duration-200 col-span-2
                ${sortOption === 'pending'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-orange-50'
                }
              `}
            >
              En attente
            </button>
          </div>
        </div>
      </div>

      {/* Liste des transferts en style tableau - Version desktop */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Magasin</th>
              <th className="py-3 px-6 text-center">Numéro</th>
              <th className="py-3 px-6 text-center">Quantité</th>
              <th className="py-3 px-6 text-center">Destination</th>
              <th className="py-3 px-6 text-center">Statut</th>
              <th className="py-3 px-6 text-center">Date</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {getPaginatedTransfers().map((transfer) => (
              <tr key={transfer._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-6 text-left">{transfer.store.name}</td>
                <td className="py-3 px-6 text-center">{transfer.transferNumber}</td>
                <td className="py-3 px-6 text-center">{transfer.quantity}</td>
                <td className="py-3 px-6 text-center">{transfer.destination}</td>
                <td className="py-3 px-6 text-center">{renderTransferStatus(transfer.status)}</td>
                <td className="py-3 px-6 text-center">{formatDate(transfer.date)}</td>
                <td className="py-3 px-6 text-center">
                  {transfer.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleValidate(transfer._id)}
                        className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 mr-2"
                        title="Valider"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </button>
                      <button
                        onClick={() => handleReject(transfer._id)}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 mr-2"
                        title="Refuser"
                      >
                        <XCircle className="w-5 h-5 text-red-500" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedTransfer(transfer)}
                    className="p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 mr-2"
                    title="Voir les détails"
                  >
                    <Eye className="w-5 h-5 text-orange-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Liste des transferts en style carte - Version mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {getPaginatedTransfers().map((transfer) => (
          <MobileTransferCard key={transfer._id} transfer={transfer} setSelectedTransfer={setSelectedTransfer} />
        ))}
      </div>

      {/* Modal des détails du transfert */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="fixed inset-0 lg:static lg:w-[800px] bg-white lg:rounded-xl shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 px-4 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Détails du transfert</h3>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="p-4 lg:p-8">
              {/* Info magasin */}
              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedTransfer.store.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Magasin</p>
                  <p className="text-lg font-medium text-gray-900">{selectedTransfer.store.name}</p>
                </div>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Numéro de transfert</p>
                  <p className="text-lg font-medium text-gray-900">{selectedTransfer.transferNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Quantité</p>
                  <p className="text-lg font-medium text-gray-900">{selectedTransfer.quantity}</p>
                </div>
              </div>

              {/* Détails supplémentaires */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="text-lg font-medium text-gray-900">{selectedTransfer.destination}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date du transfert</p>
                  <p className="text-lg font-medium text-gray-900">{formatDate(selectedTransfer.date)}</p>
                </div>
              </div>

              {/* Statut et date de création */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 block mb-2">Statut</span>
                  {renderTransferStatus(selectedTransfer.status)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 block mb-2">Date de création</span>
                  <span className="text-lg font-medium text-gray-900">
                    {format(new Date(selectedTransfer.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>

              {/* Boutons d'action sur mobile */}
              {selectedTransfer.status === 'pending' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 lg:hidden">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        handleValidate(selectedTransfer._id);
                        setSelectedTransfer(null);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTransfer._id);
                        setSelectedTransfer(null);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Refuser
                    </button>
                  </div>
                </div>
              )}

              {/* Ajouter un padding en bas sur mobile pour éviter que le contenu soit caché par les boutons fixes */}
              {selectedTransfer.status === 'pending' && (
                <div className="h-20 lg:hidden"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages de succès */}
      <AnimatePresence>
        {showValidateSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <SuccessMessage
              title="Transfert validé !"
              message="Le transfert a été validé avec succès."
            />
          </div>
        )}
        {showRejectSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <SuccessMessage
              title="Transfert refusé !"
              message="Le transfert a été refusé avec succès."
            />
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
        {/* Information sur les résultats */}
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200/50 backdrop-blur-xl">
            <span className="text-sm text-gray-500">Total</span>
            <span className="mx-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {getSortedTransfers().length}
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
              {generatePageNumbers(currentPage, calculatedTotalPages).map((pageNum: number | string, idx: number) => (
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
              disabled={currentPage === calculatedTotalPages}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentPage === calculatedTotalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              title="Page suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentPage(calculatedTotalPages)}
              disabled={currentPage === calculatedTotalPages}
              className={`p-2 rounded-xl transition-all duration-200 ${
                currentPage === calculatedTotalPages
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
