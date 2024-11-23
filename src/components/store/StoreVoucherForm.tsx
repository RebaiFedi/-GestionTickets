import React, { useState } from 'react';
import { FileUp, X } from 'lucide-react';
import { VoucherVerification } from './types';
import { AnimatePresence } from 'framer-motion';
import SuccessMessage from './SuccessMessage';

interface StoreVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  voucherVerification: VoucherVerification;
  setVoucherVerification: React.Dispatch<React.SetStateAction<VoucherVerification>>;
  handleVoucherSubmit: (e: React.FormEvent) => void;
  voucherFormError: string | null;
}

export default function StoreVoucherForm({
  isOpen,
  onClose,
  voucherVerification,
  setVoucherVerification,
  handleVoucherSubmit: onSubmit,
  voucherFormError
}: StoreVoucherFormProps) {
  if (!isOpen) return null;

  const [fileName, setFileName] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(e);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white w-full h-full lg:h-auto lg:w-[55%] rounded-none lg:rounded-xl shadow-2xl overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Vérification du bon d'achat</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 lg:rounded-b-xl">
          <div className="mx-auto">
            {voucherFormError && (
              <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-lg">
                <p className="font-medium">Erreur</p>
                <p>{voucherFormError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Informations du bon</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Numéro du bon</label>
                    <input
                      type="text"
                      value={voucherVerification.voucherNumber}
                      onChange={(e) => setVoucherVerification({...voucherVerification, voucherNumber: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Montant</label>
                    <input
                      type="number"
                      value={voucherVerification.amount}
                      onChange={(e) => setVoucherVerification({...voucherVerification, amount: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Informations client</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nom et Prénom</label>
                    <input
                      type="text"
                      value={voucherVerification.fullName}
                      onChange={(e) => setVoucherVerification({...voucherVerification, fullName: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Numéro CIN</label>
                    <input
                      type="text"
                      value={voucherVerification.cin}
                      onChange={(e) => setVoucherVerification({...voucherVerification, cin: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Détails du bon</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Type de Bon</label>
                    <input
                      type="text"
                      value={voucherVerification.voucherType}
                      onChange={(e) => setVoucherVerification({...voucherVerification, voucherType: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date du Bon</label>
                    <input
                      type="date"
                      value={voucherVerification.voucherDate}
                      onChange={(e) => setVoucherVerification({...voucherVerification, voucherDate: e.target.value})}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl shadow-sm">
                <div className="flex items-center justify-between p-2 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-500 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileUp className="h-6 w-6 text-gray-400" />
                    <div>
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-base font-medium text-orange-600 hover:text-orange-500"
                      >
                        Sélectionner un fichier
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVoucherVerification({...voucherVerification, image: file});
                              setFileName(file.name);
                            }
                          }}
                          required
                        />
                      </label>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                    </div>
                  </div>
                  {fileName && (
                    <div className="flex items-center space-x-2 bg-orange-50 px-2 py-1 rounded-lg">
                      <span className="text-xs text-orange-700 font-medium">{fileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFileName('');
                          setVoucherVerification({...voucherVerification, image: null});
                        }}
                        className="text-orange-700 hover:text-orange-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                  Vérifier
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <SuccessMessage
            title="Bon d'achat créé !"
            message="Votre bon d'achat a été enregistré. Vous pouvez en ajouter un autre avec le même numéro."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
