import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface CashierDetail {
  name: string;
  storeName: string;
  deletions: number;
  modifications: number;
  totalTickets: number;
  totalAmount: number;
}

interface CashierDetailsTableProps {
  cashiers: CashierDetail[];
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

export default function CashierDetailsTable({
  cashiers,
  onSort,
  sortField,
  sortDirection,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage
}: CashierDetailsTableProps) {
  const validCashiers = cashiers
    ?.filter(Boolean)
    .sort((a, b) => {
      const totalOpsA = (a.deletions || 0) + (a.modifications || 0);
      const totalOpsB = (b.deletions || 0) + (b.modifications || 0);
      return totalOpsB - totalOpsA;
    }) || [];

  if (sortField !== 'totalOps') {
    validCashiers.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalTickets':
          comparison = (b.totalTickets || 0) - (a.totalTickets || 0);
          break;
        case 'deletions':
          comparison = (b.deletions || 0) - (a.deletions || 0);
          break;
        case 'modifications':
          comparison = (b.modifications || 0) - (a.modifications || 0);
          break;
        case 'totalAmount':
          comparison = (b.totalAmount || 0) - (a.totalAmount || 0);
          break;
        default:
          break;
      }
      return sortDirection === 'asc' ? -comparison : comparison;
    });
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-white" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-white" />
      : <ArrowDown className="w-4 h-4 text-white" />;
  };

  const totalPages = Math.ceil(validCashiers.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return validCashiers.slice(startIndex, endIndex);
  };

  const generatePageNumbers = () => {
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

  const getRowStyle = (index: number) => {
    if (index === 0) return 'bg-red-100/80 hover:bg-red-200/80';
    if (index === 1) return 'bg-red-50/80 hover:bg-red-100/80';
    if (index === 2) return 'bg-red-50/60 hover:bg-red-100/60';
    
    return index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <th className="px-6 py-4 cursor-pointer text-center" onClick={() => onSort('name')}>
                <div className="flex items-center justify-center space-x-2">
                  <span>Caissier</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer text-center" onClick={() => onSort('storeName')}>
                <div className="flex items-center justify-center space-x-2">
                  <span>Magasin</span>
                  <SortIcon field="storeName" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer text-center" onClick={() => onSort('totalTickets')}>
                <div className="flex items-center justify-center space-x-2">
                  <span>Total Tickets</span>
                  <SortIcon field="totalTickets" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer text-center" onClick={() => onSort('deletions')}>
                <div className="flex items-center justify-center space-x-2">
                  <span>Suppressions</span>
                  <SortIcon field="deletions" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer text-center" onClick={() => onSort('modifications')}>
                <div className="flex items-center justify-center space-x-2">
                  <span>Modifications</span>
                  <SortIcon field="modifications" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer text-center" onClick={() => onSort('totalAmount')}>
                <div className="flex items-center justify-center space-x-2">
                  <span>Montant Total</span>
                  <SortIcon field="totalAmount" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {getCurrentPageItems().map((cashier, index) => (
              <tr 
                key={`${cashier.name}-${index}`}
                className={`transition-colors duration-150 ${getRowStyle(index)}`}
              >
                <td className={`px-6 py-4 font-medium text-center ${index < 3 ? 'text-red-700' : ''}`}>
                  {cashier.name || 'N/A'}
                </td>
                <td className={`px-6 py-4 font-medium text-center ${index < 3 ? 'text-red-700' : ''}`}>
                  {cashier.storeName || cashier.store?.name || 'N/A'}
                </td>
                <td className={`px-6 py-4 text-center ${index < 3 ? 'text-red-600 font-semibold' : 'text-red-600'}`}>
                  {cashier.totalTickets || 0}
                </td>
                <td className={`px-6 py-4 text-center ${index < 3 ? 'text-red-600 font-semibold' : 'text-red-600'}`}>
                  {cashier.deletions || 0}
                </td>
                <td className={`px-6 py-4 text-center ${index < 3 ? 'text-blue-600 font-semibold' : 'text-blue-600'}`}>
                  {cashier.modifications || 0}
                </td>
                <td className={`px-6 py-4 text-center ${index < 3 ? 'text-red-700 font-semibold' : ''}`}>
                  {(cashier.totalAmount || 0).toFixed(2)} TND
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-200/50 backdrop-blur-xl">
            <span className="text-sm text-gray-500">Total</span>
            <span className="mx-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {validCashiers.length}
            </span>
            <span className="text-sm text-gray-500">caissiers</span>
          </div>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setCurrentPage(1);
              setItemsPerPage(Number(e.target.value));
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
              {generatePageNumbers().map((pageNum, idx) => (
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