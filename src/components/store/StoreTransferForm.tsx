import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TransferFormData } from './types';
import { AnimatePresence } from 'framer-motion';
import SuccessMessage from './SuccessMessage';

interface StoreTransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: TransferFormData;
  setTransferData: React.Dispatch<React.SetStateAction<TransferFormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  transferFormError: string | null;
}

export default function StoreTransferForm({
  isOpen,
  onClose,
  transferData,
  setTransferData,
  handleSubmit: onSubmit,
  transferFormError
}: StoreTransferFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(e);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      // Gestion des erreurs...
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white w-full h-full lg:h-auto lg:w-[55%] rounded-none lg:rounded-xl shadow-2xl overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Nouveau Transfert</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 lg:rounded-b-xl">
          <div className="mx-auto">
            {transferFormError && (
              <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-lg">
                <p className="font-medium">Erreur</p>
                <p>{transferFormError}</p>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Informations du transfert</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Numéro de transfert</label>
                    <input
                      type="text"
                      value={transferData.transferNumber}
                      onChange={(e) => setTransferData({...transferData, transferNumber: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Quantité</label>
                    <input
                      type="number"
                      value={transferData.quantity}
                      onChange={(e) => setTransferData({...transferData, quantity: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Détails du transfert</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={transferData.date}
                      onChange={(e) => setTransferData({...transferData, date: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <input
                      type="text"
                      value={transferData.destination}
                      onChange={(e) => setTransferData({...transferData, destination: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse lg:flex-row justify-end space-y-3 space-y-reverse lg:space-y-0 lg:space-x-3 pb-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full lg:w-auto px-4 py-2.5 text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full lg:w-auto px-4 py-2.5 text-base text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors"
                >
                  Créer le transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <SuccessMessage
            title="Transfert créé !"
            message="Votre demande de transfert a été enregistrée avec succès."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
