import React, { useState } from 'react';
import { FileUp, X, Loader2, CheckCircle } from 'lucide-react';
import { TicketType } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: TicketType;
  code: string;
  setCode: (value: string) => void;
  caissier: string;
  setCaissier: (value: string) => void;
  cause: string;
  setCause: (value: string) => void;
  oldPaymentMethod: string;
  setOldPaymentMethod: (value: string) => void;
  newPaymentMethod: string;
  setNewPaymentMethod: (value: string) => void;
  oldPaymentMethod2: string;
  setOldPaymentMethod2: (value: string) => void;
  newPaymentMethod2: string;
  setNewPaymentMethod2: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  dateTicket: string;
  setDateTicket: (value: string) => void;
  showSecondPaymentMethod: boolean;
  setShowSecondPaymentMethod: (value: boolean) => void;
  setImage: (file: File | null) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  paymentMethods: string[];
  ticketFormError: string | null;
}

export default function StoreTicketForm({
  isOpen,
  onClose,
  ticketType,
  code,
  setCode,
  caissier,
  setCaissier,
  cause,
  setCause,
  oldPaymentMethod,
  setOldPaymentMethod,
  newPaymentMethod,
  setNewPaymentMethod,
  oldPaymentMethod2,
  setOldPaymentMethod2,
  newPaymentMethod2,
  setNewPaymentMethod2,
  amount,
  setAmount,
  dateTicket,
  setDateTicket,
  showSecondPaymentMethod,
  setShowSecondPaymentMethod,
  setImage,
  handleSubmit: onSubmit,  // Renommé pour éviter la confusion
  paymentMethods,
  ticketFormError
}: StoreTicketFormProps) {
  if (!isOpen) return null;

  // Ajout d'un état pour le nom du fichier
  const [fileName, setFileName] = useState<string>('');

  // Ajouter ces états dans le composant
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Nouvelle fonction handleSubmit qui enveloppe onSubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e as React.FormEvent<HTMLFormElement>);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white w-full h-full lg:h-auto lg:w-[55%] rounded-none lg:rounded-xl shadow-2xl overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-xl">
          <h2 className="text-xl font-bold text-white">
            {ticketType === 'delete' ? 'Nouveau ticket de suppression' : 'Nouveau ticket de modification'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 lg:rounded-b-xl">
          <div className="mx-auto">
            {ticketFormError && (
              <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-lg">
                <p className="font-medium">Erreur</p>
                <p>{ticketFormError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Informations principales */}
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">Informations principales</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Caissier</label>
                    <input
                      type="text"
                      value={caissier}
                      onChange={(e) => setCaissier(e.target.value)}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date du ticket</label>
                    <input
                      type="date"
                      value={dateTicket}
                      onChange={(e) => setDateTicket(e.target.value)}
                      className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Détails spécifiques */}
              {ticketType === 'delete' ? (
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Détails de la suppression</h3>
                  <div className="space-y-3">
                    {/* Champ cause en pleine largeur */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Cause</label>
                      <textarea
                        value={cause}
                        onChange={(e) => setCause(e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        rows={2}
                        required
                      />
                    </div>
                    
                    {/* Champ montant en pleine largeur en dessous de la cause */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Montant</label>
                      <input
                        type="number"
                        step="0.001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        required
                        placeholder="Entrez le montant..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Détails de la modification</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Ancien mode de paiement</label>
                          <select
                            value={oldPaymentMethod}
                            onChange={(e) => setOldPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            required
                          >
                            <option value="">Sélectionnez un mode de paiement</option>
                            {paymentMethods.map((method, index) => (
                              <option key={index} value={method}>{method}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Nouveau mode de paiement</label>
                          <select
                            value={newPaymentMethod}
                            onChange={(e) => setNewPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            required
                          >
                            <option value="">Sélectionnez un mode de paiement</option>
                            {paymentMethods.map((method, index) => (
                              <option key={index} value={method}>{method}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {showSecondPaymentMethod && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Ancien mode de paiement 2</label>
                            <select
                              value={oldPaymentMethod2}
                              onChange={(e) => setOldPaymentMethod2(e.target.value)}
                              className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            >
                              <option value="">Sélectionnez un mode de paiement</option>
                              {paymentMethods.map((method, index) => (
                                <option key={index} value={method}>{method}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Nouveau mode de paiement 2</label>
                            <select
                              value={newPaymentMethod2}
                              onChange={(e) => setNewPaymentMethod2(e.target.value)}
                              className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            >
                              <option value="">Sélectionnez un mode de paiement</option>
                              {paymentMethods.map((method, index) => (
                                <option key={index} value={method}>{method}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Déplacé le champ Montant ici */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Montant</label>
                        <input
                          type="number"
                          step="0.001"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          required
                          placeholder="Entrez le montant..."
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSecondPaymentMethod(!showSecondPaymentMethod)}
                        className="w-full px-4 py-2 text-base text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        {showSecondPaymentMethod 
                          ? "Supprimer le 2 ème mode de paiement" 
                          : "Ajouter un 2 ème mode de paiement"
                        }
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Section Image */}
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
                              setImage(file);
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
                          setImage(null);
                        }}
                        className="text-orange-700 hover:text-orange-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col-reverse lg:flex-row justify-end space-y-3 space-y-reverse lg:space-y-0 lg:space-x-3 pb-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full lg:w-auto px-4 py-2.5 text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full lg:w-auto relative px-4 py-2.5 text-base text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Créer le ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Message de succès intégré */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center space-y-4 max-w-md mx-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {ticketType === 'delete' 
                  ? 'Demande de suppression créée !'
                  : 'Demande de modification créée !'}
              </h3>
              <p className="text-gray-500 text-center">
                {ticketType === 'delete'
                  ? 'Votre demande de suppression a été enregistrée avec succès.'
                  : 'Votre demande de modification a été enregistrée avec succès.'}
              </p>
              <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-green-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
