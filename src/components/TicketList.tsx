import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HiTrash, HiArchive, HiPhotograph } from 'react-icons/hi';

interface Ticket {
  _id: string;
  code: string;
  caissier: string;
  type: 'delete' | 'modify';
  status: 'pending' | 'approved' | 'rejected';
  store: {
    _id: string;
    name: string;
  };
  user: {
    _id: string;
    username: string;
  };
  cause?: string;
  oldPaymentMethod?: string;
  newPaymentMethod?: string;
  amount?: number;
  image?: string;
  createdAt: string;
  isArchived: boolean;
}

interface TicketListProps {
  tickets: Ticket[];
}

export default function TicketList({ tickets }: TicketListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Tous les tickets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 font-semibold">Magasin</th>
              <th className="p-3 font-semibold">Code</th>
              <th className="p-3 font-semibold">Caissier</th>
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Détails</th>
              <th className="p-3 font-semibold">Statut</th>
              <th className="p-3 font-semibold">Date de création</th>
              <th className="p-3 font-semibold">Image</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3">{ticket.store.name}</td>
                <td className="p-3">{ticket.code}</td>
                <td className="p-3">{ticket.caissier}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.type === 'delete' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                  }`}>
                    {ticket.type === 'delete' ? 'Suppression' : 'Modification'}
                  </span>
                </td>
                <td className="p-3">
                  {ticket.type === 'delete' ? (
                    ticket.cause
                  ) : (
                    <>
                      <p>Ancien mode : {ticket.oldPaymentMethod}</p>
                      <p>Nouveau mode : {ticket.newPaymentMethod}</p>
                      <p>Montant : {ticket.amount}€</p>
                    </>
                  )}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'approved' ? 'bg-green-200 text-green-800' :
                    ticket.status === 'rejected' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {ticket.status === 'approved' ? 'Validé' :
                     ticket.status === 'rejected' ? 'Refusé' :
                     'En cours'}
                  </span>
                </td>
                <td className="p-3">
                  {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </td>
                <td className="p-3">
                  {ticket.image && (
                    <HiPhotograph className="w-6 h-6 text-blue-500" />
                  )}
                </td>
                <td className="p-3">
                  <button className="text-red-500 hover:text-red-700 mr-2">
                    <HiTrash />
                  </button>
                  {!ticket.isArchived && (
                    <button className="text-yellow-500 hover:text-yellow-700 mr-2" title="Archiver le ticket">
                      <HiArchive className="w-5 h-5" />
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
