import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';

interface AdminTransfer {
  _id: string;
  transferNumber: string;
  quantity: number;
  date: string;
  destination: string;
  status: string;
  createdAt: string;
  store: {
    name: string;
  };
}

interface AdminTransferListProps {
  transfers: AdminTransfer[];
  searchTerm: string;
  handleProcessTransfer: (id: string) => Promise<void>;
}

export default function AdminTransferList({ 
  transfers, 
  searchTerm,
  handleProcessTransfer 
}: AdminTransferListProps) {
  const filteredTransfers = transfers.filter(transfer =>
    transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const renderTransferStatus = (status: string) => {
    switch (status) {
      case 'completed': return 'Validé';
      case 'cancelled': return 'Refusé';
      case 'validated_and_processed': return 'Validé et traité';
      default: return 'En cours';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4">Magasin</th>
              <th className="p-4">Numéro</th>
              <th className="p-4">Quantité</th>
              <th className="p-4">Date</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Date de validation</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.map(transfer => (
              <tr key={transfer._id} className="border-b border-orange-100 hover:bg-orange-50">
                <td className="p-4">{transfer.store?.name || 'N/A'}</td>
                <td className="p-4">{transfer.transferNumber}</td>
                <td className="p-4">{transfer.quantity}</td>
                <td className="p-4">{formatDate(transfer.date)}</td>
                <td className="p-4">{transfer.destination}</td>
                <td className="p-4">{formatDate(transfer.createdAt)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    transfer.status === 'validated_and_processed' ? 'bg-green-200 text-green-800' :
                    transfer.status === 'completed' ? 'bg-blue-200 text-blue-800' :
                    transfer.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {renderTransferStatus(transfer.status)}
                  </span>
                </td>
                <td className="p-4">
                  {transfer.status === 'completed' && (
                    <button
                      onClick={() => handleProcessTransfer(transfer._id)}
                      className="text-purple-500 hover:text-purple-700"
                      title="Marquer comme traité"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
