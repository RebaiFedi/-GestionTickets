import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
import { CegidUser } from '../store/types';

interface AdminCegidUserListProps {
  users: CegidUser[];
  onSetUserLogin: (userId: string, userLogin: string) => Promise<void>;
}

export default function AdminCegidUserList({ users, onSetUserLogin }: AdminCegidUserListProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userLogin, setUserLogin] = useState('');

  const handleSubmit = async (userId: string) => {
    try {
      await onSetUserLogin(userId, userLogin);
      setEditingUser(null);
      setUserLogin('');
    } catch (error) {
      console.error('Erreur lors de la définition du User Login:', error);
    }
  };

  const renderUserStatus = (status: string) => {
    const statusConfig = {
      completed: {
        text: 'Validé',
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'text-green-600'
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gradient-to-l from-orange-400 via-orange-500 to-orange-600">
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">Magasin</span>
            </th>
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">Nom Complet</span>
            </th>
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">Groupe</span>
            </th>
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">User Login</span>
            </th>
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">Statut</span>
            </th>
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">Date</span>
            </th>
            <th className="px-6 py-4">
              <span className="text-white text-[15px] font-bold uppercase tracking-wider">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user, index) => (
            <tr key={user._id} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
              <td className="px-6 py-4">
                <span className="text-slate-700 font-medium">{user.store?.name || 'N/A'}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-slate-700 font-medium">{user.fullName}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-slate-700 font-medium">{user.userGroup}</span>
              </td>
              <td className="px-6 py-4">
                {editingUser === user._id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={userLogin}
                      onChange={(e) => setUserLogin(e.target.value)}
                      className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Entrer User Login"
                    />
                    <button
                      onClick={() => handleSubmit(user._id)}
                      className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-700 font-medium">
                    {user.userLogin || 'Non défini'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {renderUserStatus(user.status)}
              </td>
              <td className="px-6 py-4">
                <span className="text-slate-700 font-medium">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </span>
              </td>
              <td className="px-6 py-4">
                {user.status === 'completed' && !user.userLogin && (
                  <button
                    onClick={() => {
                      setEditingUser(user._id);
                      setUserLogin('');
                    }}
                    className="p-2 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-5 h-5 text-orange-500" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
