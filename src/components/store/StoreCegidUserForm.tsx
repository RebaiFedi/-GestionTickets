import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import SuccessMessage from './SuccessMessage';

interface StoreCegidUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    fullName: string;
    userGroup: string;
  };
  setUserData: React.Dispatch<React.SetStateAction<{
    fullName: string;
    userGroup: string;
  }>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  formError: string | null;
}

export default function StoreCegidUserForm({
  isOpen,
  onClose,
  userData,
  setUserData,
  handleSubmit: onSubmit,
  formError
}: StoreCegidUserFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white w-full h-full lg:h-auto lg:w-[500px] rounded-none lg:rounded-xl shadow-2xl overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Nouvel utilisateur CEGID</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 lg:rounded-b-xl">
          <div className="mx-auto">
            {formError && (
              <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-lg">
                <p className="font-medium">Erreur</p>
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nom Complet</label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                  className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Groupe Utilisateur</label>
                <input
                  type="text"
                  value={userData.userGroup}
                  onChange={(e) => setUserData({...userData, userGroup: e.target.value})}
                  className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
              </div>
              <div className="flex flex-col-reverse lg:flex-row justify-end space-y-3 space-y-reverse lg:space-y-0 lg:space-x-3">
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
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <SuccessMessage
            title="Utilisateur CEGID créé !"
            message="Votre demande de création d'utilisateur a été enregistrée avec succès."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
