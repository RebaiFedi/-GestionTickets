'use client';

import React, { useState, useEffect } from 'react';
import { HiUserAdd, HiTrash, HiUser, HiOfficeBuilding, HiLink, HiTicket, HiCheck, HiX, HiPlus, HiMinus, HiChevronDown, HiChevronUp, HiPencilAlt, HiEye, HiPhotograph, HiSearch, HiArchive, HiClipboardCheck, HiTicket as HiTicketIcon, HiClipboardCheck as HiClipboardCheckIcon, HiOfficeBuilding as HiOfficeBuildingIcon, HiUserGroup } from 'react-icons/hi';
import api, { getImageUrl } from '../api';
import ErrorMessage from './ErrorMessage';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import AdminTransferList from './admin/AdminTransferList';
import AdminCegidUserList from './admin/AdminCegidUserList';
import { Store, Package2, UserCheck, AlertTriangle, Calendar, Users, Award, BarChart2, Trash2, DollarSign, Activity, Edit, TrendingUp, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, X, Plus, Check } from 'lucide-react';
import { Archive as ArchiveIcon, Receipt as ReceiptIcon, ArrowLeftRight as ArrowLeftRightIcon } from 'lucide-react';
import AdminSidebar from './admin/AdminSidebar';
import { CegidUser } from './store/types';

type TabType = 'users' | 'districts' | 'tickets' | 'archivedTickets' | 'vouchers' | 'transfers' | 'cegidUsers';

interface User {
  _id: string;
  username: string;
  role: string;
  email?: string;
}

interface Ticket {
  _id: string;
  code: string;
  caissier: string;
  type: 'delete' | 'modify';
  status: 'pending' | 'approved' | 'rejected' | 'validated_and_processed' | 'cancelled';
  store: {
    _id: string;
    name: string;
  };
  cause?: string;
  oldPaymentMethod?: string;
  newPaymentMethod?: string;
  oldPaymentMethod2?: string;
  newPaymentMethod2?: string;
  amount?: number;
  image?: string;
  createdAt: string;
  isArchived: boolean;
}

interface District {
  _id: string;
  name: string;
  user: {
    _id: string;
    username: string;
  };
}

interface Store {
  _id: string;
  name: string;
  districts: string[];
}

interface Voucher {
  _id: string;
  voucherNumber: string;
  amount: number;
  image?: string;
  createdAt: string;
  store: {
    _id: string;
    name: string;
  };
  status: string;
}

interface GlobalStats {
  totalTickets: number;
  vouchersToVerify: number;
  storeUsers: number;
  districtUsers: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

// Ajouter cette interface pour les tabs
interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

// Ajouter cette interface pour la notification
interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

// Composant Notification
const Notification = ({ message, type, onClose }: NotificationProps) => (
  <motion.div
    initial={{ opacity: 0, y: -100 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -100 }}
    className="fixed top-4 right-4 z-50"
  >
    <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
      type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
    }`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        type === 'success' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {type === 'success' ? (
          <Check className="w-5 h-5" />
        ) : (
          <X className="w-5 h-5" />
        )}
      </div>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

// Composant Modal de création/modification
const UserFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  formData,
  setFormData,
  editingUser = null 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    username: string;
    email: string;
    password: string;
    role: string;
  };
  setFormData: {
    setUsername: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setRole: (value: string) => void;
  };
  editingUser?: User | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-lg font-semibold text-white">
            {editingUser ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData.setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData.setRole(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="admin">Admin</option>
              <option value="district">District</option>
              <option value="store">Store</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>

          {formData.role === 'district' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData.setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingUser ? "Nouveau mot de passe" : "Mot de passe"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData.setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              required={!editingUser}
              placeholder={editingUser ? "Laisser vide pour ne pas modifier" : ""}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              {editingUser ? "Mettre à jour" : "Créer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Ajouter ce composant pour le popup de gestion des districts
const DistrictManagementModal = ({ 
  isOpen, 
  onClose,
  selectedDistrict,
  setSelectedDistrict,
  selectedStores,
  setSelectedStores,
  districts,
  stores,
  handleLinkDistrictStores
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
  setSelectedDistrict: (id: string) => void;
  selectedStores: string[];
  setSelectedStores: (stores: string[]) => void;
  districts: District[];
  stores: Store[];
  handleLinkDistrictStores: () => void;
}) => {
  if (!isOpen) return null;

  // Obtenir les magasins liés au district sélectionné
  const getLinkedStores = (districtId: string) => {
    return stores.filter(store => store.districts.includes(districtId));
  };

  // Mettre à jour la sélection des magasins quand un district est sélectionné
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    if (districtId) {
      const linkedStores = getLinkedStores(districtId).map(store => store._id);
      setSelectedStores(linkedStores);
    } else {
      setSelectedStores([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-500 to-orange-600">
          <h3 className="text-lg font-semibold text-white">Gestion des Districts</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sélection du district */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Sélectionner un district
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              >
                <option value="">Choisir un district</option>
                {districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.user ? district.user.username : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection des magasins */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Sélectionner les magasins
              </label>
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-xl divide-y">
                {stores.map((store) => {
                  const isLinked = selectedDistrict && store.districts.includes(selectedDistrict);
                  return (
                    <label
                      key={store._id}
                      className={`flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors ${
                        isLinked ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStores([...selectedStores, store._id]);
                          } else {
                            setSelectedStores(selectedStores.filter(id => id !== store._id));
                          }
                        }}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-3 text-gray-700">{store.name}</span>
                      {isLinked && (
                        <span className="ml-auto text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          Déjà lié
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bouton de liaison */}
          <div className="mt-6">
            <button
              onClick={() => {
                handleLinkDistrictStores();
                onClose();
              }}
              disabled={!selectedDistrict || selectedStores.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mettre à jour les liaisons
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [districtStoreLinks, setDistrictStoreLinks] = useState<{[key: string]: string[]}>({});
  const [openDistrict, setOpenDistrict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [currentImage, setCurrentImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [validatedTickets, setValidatedTickets] = useState<Ticket[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalTickets: 0,
    vouchersToVerify: 0,
    storeUsers: 0,
    districtUsers: 0
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [archiveNotifications, setArchiveNotifications] = useState<{ id: number, type: 'success' | 'warning' | 'error', message: string }[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transferSearchTerm, setTransferSearchTerm] = useState('');
  const [cegidUsers, setCegidUsers] = useState<CegidUser[]>([]);
  const [cegidUserSearchTerm, setCegidUserSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [usersPerPage] = useState(8);
  const [showDistrictModal, setShowDistrictModal] = useState(false);

  // Définir les tabs
  const tabs: Tab[] = [
    { id: 'users', label: 'Utilisateurs', icon: <Users className="w-5 h-5" /> },
    { id: 'districts', label: 'Districts', icon: <Store className="w-5 h-5" /> },
    { id: 'tickets', label: 'Tickets', icon: <Package2 className="w-5 h-5" /> },
    { id: 'archivedTickets', label: 'Archives', icon: <ArchiveIcon className="w-5 h-5" /> },
    { id: 'vouchers', label: "Bons d'achat", icon: <ReceiptIcon className="w-5 h-5" /> },
    { id: 'transfers', label: 'Transferts', icon: <ArrowLeftRightIcon className="w-5 h-5" /> },
    { id: 'cegidUsers', label: 'Utilisateurs CEGID', icon: <Users className="w-5 h-5" /> }
  ];

  useEffect(() => {
    setIsClient(true);
    fetchTickets();
    fetchArchivedTickets();
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchTickets();
    fetchDistricts();
    fetchStores();
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      if (activeTab === 'tickets') {
        fetchValidatedTickets();
      } else if (activeTab === 'archivedTickets') {
        fetchArchivedTickets();
      } else if (activeTab === 'cegidUsers') {
        fetchValidatedCegidUsers();
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'transfers') {
      fetchValidatedTransfers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      console.log('Tentative de récupération des utilisateurs');
      const response = await api.get('/users');
      console.log('Réponse de l\'API (utilisateurs):', response.data);
      setUsers(response.data);
    } catch (error: any) {
      console.error('Erreur détaillée lors de la récupération des utilisateurs:', error);
      if (error.response) {
        console.error('Réponse d\'erreur:', error.response.data);
        console.error('Statut de l\'erreur:', error.response.status);
        console.error('En-têtes de l\'erreur:', error.response.headers);
      } else if (error.request) {
        console.error('Pas de réponse reçue:', error.request);
      } else {
        console.error('Erreur de configuration de la requête:', error.message);
      }
      setError("Erreur lors de la récupération des utilisateurs: " + (error.response?.data || error.message));
    }
  };

  const fetchTickets = async () => {
    try {
      console.log('Tentative de récupération des tickets pour l\'Admin');
      const response = await api.get(`/tickets?page=${currentPage}&limit=10&search=${searchTerm}`);
      console.log('Réponse complète de fetchTickets (Admin):', response);
      console.log('Données de la réponse:', response.data);
      if (Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        console.error('Format de réponse inattendu:', response.data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Erreur détaillée lors de la récupération des tickets:', error);
      setError("Erreur lors de la récupération des tickets");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { username, password, role };
      if (role === 'district') {
        Object.assign(userData, { email });
      }
      
      const response = await api.post('/users', userData);
      
      // Recharger immédiatement les données
      await Promise.all([
        fetchUsers(),      // Recharger la liste des utilisateurs
        fetchDistricts(), // Recharger les districts si nécessaire
        fetchStores()     // Recharger les magasins si nécessaire
      ]);
      
      // Réinitialiser le formulaire
      resetForm();
      
      // Fermer le modal
      setShowUserFormModal(false);
      
      // Afficher la notification de succès
      setNotificationMessage("Utilisateur créé avec succès");
      setNotificationType('success');
      setShowNotification(true);
      
      // Fermer la notification après 3 secondes
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

    } catch (error: any) {
      // En cas d'erreur, afficher une notification d'erreur
      setNotificationMessage(error.response?.data?.msg || "Erreur lors de la création de l'utilisateur");
      setNotificationType('error');
      setShowNotification(true);
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  const handleDeleteTicket = async (ticketId: string, isArchived: boolean = false) => {
    try {
      console.log('Tentative de suppression du ticket:', ticketId);
      const response = await api.delete(`/tickets/${ticketId}`);
      console.log('Réponse de suppression:', response.data);
      if (response.status === 200) {
        if (isArchived) {
          setArchivedTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== ticketId));
        } else {
          setValidatedTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== ticketId));
        }
        setError(null);
      } else {
        setError("Erreur lors de la suppression du ticket: " + response.data.msg);
      }
    } catch (error: any) {
      console.error('Erreur détaillée lors de la suppression du ticket:', error.response?.data || error.message);
      setError("Erreur lors de la suppression du ticket: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleViewTicket = (ticketId: string) => {
    // Logique pour afficher les détails du ticket
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await api.delete(`/users/${userId}`);
        
        if (response.status === 200) {
          // Mettre à jour la liste des utilisateurs
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
          
          // Recharger immédiatement les districts et les magasins
          await Promise.all([
            fetchDistricts(),
            fetchStores()
          ]);
          
          // Réinitialiser les sélections si nécessaire
          if (selectedDistrict === userId) {
            setSelectedDistrict('');
            setSelectedStores([]);
          }
          
          // Afficher la notification
          setNotificationMessage("Utilisateur supprimé avec succès");
          setNotificationType('success');
          setShowNotification(true);
          
          setTimeout(() => {
            setShowNotification(false);
          }, 3000);
        }
      } catch (error: any) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        setNotificationMessage(error.response?.data?.msg || "Erreur lors de la suppression de l'utilisateur");
        setNotificationType('error');
        setShowNotification(true);
      }
    }
  };

  const handleEditUser = (user: User) => {
    console.log('Editing user:', user); // Pour le debug
    setEditingUser(user);
    setUsername(user.username);
    setRole(user.role);
    setEmail(user.email || '');
    setPassword('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await api.put(`/users/${editingUser._id}`, {
        username,
        role,
        ...(password && { password }),
        ...(email && { email })
      });

      setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
      setShowEditModal(false);
      setEditingUser(null);
      
      // Afficher la notification de succès
      setNotificationMessage("Utilisateur modifié avec succès");
      setNotificationType('success');
      setShowNotification(true);
      
      // Fermer la notification après 3 secondes
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      setNotificationMessage("Erreur lors de la modification de l'utilisateur");
      setNotificationType('error');
      setShowNotification(true);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await api.get('/districts');
      // Filtrer pour ne garder que les districts qui ont un utilisateur valide
      const activeDistricts = response.data.filter((district: District) => district.user && district.user._id);
      setDistricts(activeDistricts);
    } catch (error) {
      console.error('Erreur lors de la récupération des districts:', error);
      setError("Erreur lors de la récupération des districts");
    }
  };

  const fetchStores = async () => {
    try {
      console.log('Tentative de récupération des magasins');
      const response = await api.get('/stores');
      console.log('Réponse de l\'API (magasins):', response.data);
      setStores(response.data);
    } catch (error) {
      console.error('Erreur détaillée lors de la rcupération des magasins:', error);
      setError("Erreur lors de la récupération des magasins");
    }
  };

  const handleLinkDistrictStores = async () => {
    if (!selectedDistrict || selectedStores.length === 0) {
      setError("Veuillez sélectionner un district et au moins un magasin");
      return;
    }
    try {
      for (const storeId of selectedStores) {
        await api.post('/districts/link', { districtId: selectedDistrict, storeId });
      }
      fetchDistricts();
      fetchStores();
      setSelectedDistrict('');
      setSelectedStores([]);
      setError(null);
    } catch (error: any) {
      console.error('Erreur lors de la liaison district-magasins:', error.response?.data);
      setError("Erreur lors de la liaison district-magasins: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleUnlinkDistrictStore = async (districtId: string, storeId: string) => {
    try {
      await api.post('/districts/unlink', { districtId, storeId });
      fetchDistricts();
      fetchStores();
    } catch (error) {
      console.error('Erreur lors de la déliaison district-magasin:', error);
      setError("Erreur lors de la déliaison district-magasin");
    }
  };

  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setLightboxOpen(true);
  };

  const fetchArchivedTickets = async () => {
    try {
      const response = await api.get('/tickets/archived');
      setArchivedTickets(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets archivés:', error);
      setError("Erreur lors de la récupération des tickets archivés");
    }
  };

  const fetchAllTickets = async () => {
    try {
      const response = await api.get('/tickets/all');
      setTickets(response.data.filter((ticket: Ticket) => !ticket.isArchived));
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      setError("Erreur lors de la récupération des tickets");
    }
  };

  const handleArchiveTicket = async (ticketId: string) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/tickets/${ticketId}/archive`);
      if (response.status === 200) {
        setValidatedTickets(prevTickets => 
          prevTickets.filter(ticket => ticket._id !== ticketId)
        );
        
        setArchivedTickets(prevTickets => [...prevTickets, response.data.ticket]);
        
        setNotification({
          type: 'success',
          message: 'Ticket archivé avec succès'
        });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'archivage du ticket:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'archivage du ticket'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValidatedTickets = async () => {
    try {
      const response = await api.get('/tickets/validated');
      setValidatedTickets(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets validés:', error);
      setError("Erreur lors de la récupération des tickets validés");
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await api.get('/tickets/vouchers');
      setVouchers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des bons d\'achat:', error);
      setError("Erreur lors de la récupération des bons d'achat");
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const response = await api.get('/tickets/admin/global-stats');
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      setError("Erreur lors de la récupération des statistiques globales");
    }
  };

  const fetchValidatedTransfers = async () => {
    try {
      const response = await api.get('/transfers/validated');
      setTransfers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts:', error);
      setError("Erreur lors de la récupération des transferts");
    }
  };

  const fetchValidatedCegidUsers = async () => {
    try {
      const response = await api.get('/cegid-users/validated');
      const typedUsers = response.data as CegidUser[];
      setCegidUsers(typedUsers);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs CEGID:', error);
      setError("Erreur lors de la récupération des utilisateurs CEGID");
    }
  };

  const renderValidatedTickets = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Tickets Validés</h2>
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
            {validatedTickets.map((ticket) => (
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
                      <p>Montant : {ticket.amount} TND</p>
                    </>
                  )}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'approved' ? 'bg-green-200 text-green-800' :
                    ticket.status === 'rejected' ? 'bg-red-200 text-red-800' :
                    ticket.status === 'validated_and_processed' ? 'bg-blue-200 text-blue-800' :
                    ticket.status === 'cancelled' ? 'bg-gray-200 text-gray-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {renderTicketStatus(ticket.status)}
                  </span>
                </td>
                <td className="p-3">
                  {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </td>
                <td className="p-3">
                  {ticket.image && (
                    <button
                      onClick={() => openLightbox(getImageUrl(ticket.image))}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <HiPhotograph className="w-6 h-6" />
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button 
                    onClick={() => handleArchiveTicket(ticket._id)}
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                    title="Archiver le ticket"
                  >
                    <HiArchive className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTicketStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Validé';
      case 'rejected':
        return 'Refusé';
      case 'validated_and_processed':
        return 'Validé et traité';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'En cours';
    }
  };

  const renderArchivedTickets = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Tickets Archivés</h2>
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
            {archivedTickets.map((ticket) => (
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
                      <p>Montant : {ticket.amount} TND</p>
                    </>
                  )}
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-200 text-blue-800">
                    Validé et traité
                  </span>
                </td>
                <td className="p-3">
                  {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </td>
                <td className="p-3">
                  {ticket.image && (
                    <button
                      onClick={() => openLightbox(getImageUrl(ticket.image))}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <HiPhotograph className="w-6 h-6" />
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button 
                    onClick={() => handleDeleteTicket(ticket._id, true)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    <HiTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {archivedTickets.length === 0 && (
        <p className="text-center text-gray-500 mt-4">Aucun ticket archivé</p>
      )}
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersTab();
      case 'districts':
        return renderDistrictsTab();
      case 'tickets':
        return renderTicketsTab();
      case 'archivedTickets':
        return renderArchivedTicketsTab();
      case 'vouchers':
        return renderVouchersTab();
      case 'transfers':
        return renderTransfersTab();
      case 'cegidUsers':
        return renderCegidUsersTab();
    }
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4 flex-col lg:flex-row gap-4 lg:gap-0">
      <div className="flex items-center space-x-4 w-full lg:w-auto">
        <div className="h-12 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
        <div className="text-left w-full lg:w-auto">
          <h1 className="text-lg lg:text-2xl font-bold text-gray-800 tracking-tight">
            {getPageTitle()}
            <div className="mt-1 text-xs lg:text-sm font-medium text-gray-500">
              {user?.username ? `Connecté en tant que ${user.username}` : 'Non connecté'}
            </div>
          </h1>
        </div>
      </div>
      <div className="hidden lg:flex h-9 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-lg items-center justify-center text-white font-semibold shadow-sm px-4">
        <span className="text-sm">ADMIN {user?.username?.toUpperCase() || 'N/A'}</span>
      </div>
    </div>
  );

  const getCurrentUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return users.slice(indexOfFirstUser, indexOfLastUser);
  };

  const totalUserPages = Math.ceil(users.length / usersPerPage);

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center text-gray-800">
              <Users className="w-5 h-5 mr-2 text-orange-500" />
              Liste des utilisateurs
            </h3>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUserFormModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvel utilisateur
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs en format carte */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {getCurrentUsers().map((user) => (
              <div 
                key={user._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50/50 transition-all duration-200 group"
              >
                {/* Informations utilisateur */}
                <div className="flex items-center space-x-6">
                  {/* Rôle Badge */}
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${user.role === 'admin' ? 'bg-orange-100 text-orange-600' :
                      user.role === 'district' ? 'bg-blue-100 text-blue-600' :
                      user.role === 'store' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'}
                  `}>
                    <Users className="w-6 h-6" />
                  </div>

                  {/* Détails */}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email || 'Email non défini'}</div>
                    <div className="mt-1">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${user.role === 'admin' ? 'bg-orange-100 text-orange-700' :
                          user.role === 'district' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'store' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination modifiée */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Affichage de {((currentPage - 1) * usersPerPage) + 1} à {Math.min(currentPage * usersPerPage, users.length)} sur {users.length} utilisateurs
              </span>
            </div>

            <nav className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                }`}
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                  .filter(pageNum => {
                    if (totalUserPages <= 5) return true;
                    if (pageNum === 1 || pageNum === totalUserPages) return true;
                    if (Math.abs(pageNum - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((pageNum, idx, arr) => (
                    <React.Fragment key={pageNum}>
                      {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                            : 'hover:bg-orange-50 text-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalUserPages))}
                disabled={currentPage === totalUserPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalUserPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentPage(totalUserPages)}
                disabled={currentPage === totalUserPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalUserPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                }`}
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal de création/modification */}
      <AnimatePresence>
        {showUserFormModal && (
          <UserFormModal
            isOpen={showUserFormModal}
            onClose={() => {
              setShowUserFormModal(false);
              resetForm();
            }}
            onSubmit={handleCreateUser}
            formData={{
              username,
              email,
              password,
              role
            }}
            setFormData={{
              setUsername,
              setEmail,
              setPassword,
              setRole
            }}
            editingUser={null}
          />
        )}
      </AnimatePresence>
    </div>
  );

  const renderDistrictsTab = () => (
    <div className="space-y-6">
      {/* En-tête avec bouton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center text-gray-800">
              <Store className="w-5 h-5 mr-2 text-orange-500" />
              Gestion des Districts
            </h3>
            <button
              onClick={() => setShowDistrictModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Gérer les liaisons
            </button>
          </div>
        </div>

        {/* Liste des liaisons existantes */}
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {districts
              .filter(district => district.user && district.user._id)
              .map((district) => (
                <div 
                  key={district._id}
                  className="bg-gray-50 rounded-xl p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {district.user ? district.user.username : 'N/A'}
                        </h4>
                        <p className="text-sm text-gray-500">District</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {stores
                      .filter(store => store.districts.includes(district._id))
                      .map((store) => (
                        <div 
                          key={store._id}
                          className="flex items-center justify-between bg-white p-2 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">{store.name}</span>
                          <button
                            onClick={() => handleUnlinkDistrictStore(district._id, store._id)}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                            title="Délier le magasin"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    
                    {stores.filter(store => store.districts.includes(district._id)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Aucun magasin lié
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal de gestion des districts */}
      <AnimatePresence>
        {showDistrictModal && (
          <DistrictManagementModal
            isOpen={showDistrictModal}
            onClose={() => {
              setShowDistrictModal(false);
              setSelectedDistrict('');
              setSelectedStores([]);
            }}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedStores={selectedStores}
            setSelectedStores={setSelectedStores}
            districts={districts}
            stores={stores}
            handleLinkDistrictStores={handleLinkDistrictStores}
          />
        )}
      </AnimatePresence>
    </div>
  );

  const renderTicketsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Gestion des Tickets Validés</h3>
      
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded mr-2 flex-grow"
        />
        <button
          onClick={() => fetchValidatedTickets()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <HiSearch className="inline-block mr-1" /> Rechercher
        </button>
      </div>

      <div className="overflow-x-auto">
        {renderTable(validatedTickets, false)}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );

  const renderArchivedTicketsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Tickets Archivés</h3>
      <div className="overflow-x-auto">
        {isClient ? renderTable(archivedTickets, true) : <p>Chargement...</p>}
      </div>
    </div>
  );

  const renderVouchersTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Vérification des bons d'achat</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Numéro du bon</th>
              <th className="text-left">Montant</th>
              <th className="text-left">Magasin</th>
              <th className="text-left">Date de création</th>
              <th className="text-left">Image</th>
              <th className="text-left">Statut</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher._id}>
                <td>{voucher.voucherNumber}</td>
                <td>{voucher.amount} TND</td>
                <td>{voucher.store ? voucher.store.name : 'N/A'}</td>
                <td>{format(new Date(voucher.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
                <td>
                  {voucher.image && (
                    <button
                      onClick={() => {
                        setCurrentImage(getImageUrl(voucher.image));
                        setLightboxOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <HiPhotograph className="w-6 h-6" />
                    </button>
                  )}
                </td>
                <td>{voucher.status}</td>
                <td>
                  <select
                    value={voucher.status}
                    onChange={(e) => handleVoucherStatusChange(voucher._id, e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="pending">En attente</option>
                    <option value="validated">Validé</option>
                    <option value="not_found">Non trouvé</option>
                    <option value="rejected">Refusé</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTransfersTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Transferts Validés</h2>
      
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un transfert..."
            value={transferSearchTerm}
            onChange={(e) => setTransferSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <AdminTransferList
        transfers={transfers}
        searchTerm={transferSearchTerm}
        handleProcessTransfer={handleProcessTransfer}
      />
    </div>
  );

  const renderCegidUsersTab = () => (
    <>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={cegidUserSearchTerm}
            onChange={(e) => setCegidUserSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <AdminCegidUserList
        users={cegidUsers}
        onSetUserLogin={handleSetUserLogin}
      />
    </>
  );

  const handleVoucherStatusChange = async (voucherId: string, newStatus: string) => {
    try {
      const response = await api.put(`/tickets/vouchers/${voucherId}/status`, { status: newStatus });
      if (response.status === 200) {
        setVouchers(vouchers.map(v => v._id === voucherId ? { ...v, status: newStatus } : v));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du bon:', error);
      setError("Erreur lors de la mise à jour du statut du bon");
    }
  };

  const renderTable = (ticketsToRender: Ticket[] = [], isArchived: boolean = false) => (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          <th className="p-3 font-semibold">Magasin</th>
          <th className="p-3 font-semibold">Code</th>
          <th className="p-3 font-semibold">Caissier</th>
          <th className="p-3 font-semibold">Type</th>
          <th className="p-3 font-semibold">Montant</th>
          <th className="p-3 font-semibold">Détails</th>
          <th className="p-3 font-semibold">Statut</th>
          <th className="p-3 font-semibold">Date de création</th>
          <th className="p-3 font-semibold">Image</th>
          <th className="p-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {ticketsToRender && ticketsToRender.length > 0 ? (
          ticketsToRender.map((ticket) => (
            <tr key={ticket._id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3">{ticket.store?.name || 'N/A'}</td>
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
                <span className="font-medium">
                  {ticket.amount ? `${ticket.amount} TND` : '-'}
                </span>
              </td>
              <td className="p-3">
                {ticket.type === 'delete' ? (
                  ticket.cause
                ) : (
                  <>
                    <p>Ancien mode : {ticket.oldPaymentMethod}</p>
                    <p>Nouveau mode : {ticket.newPaymentMethod}</p>
                    {ticket.oldPaymentMethod2 && ticket.newPaymentMethod2 && (
                      <>
                        <p>Ancien mode 2 : {ticket.oldPaymentMethod2}</p>
                        <p>Nouveau mode 2 : {ticket.newPaymentMethod2}</p>
                      </>
                    )}
                  </>
                )}
              </td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  ticket.status === 'approved' ? 'bg-green-200 text-green-800' :
                  ticket.status === 'rejected' ? 'bg-red-200 text-red-800' :
                  ticket.status === 'validated_and_processed' ? 'bg-blue-200 text-blue-800' :
                  ticket.status === 'cancelled' ? 'bg-gray-200 text-gray-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {renderTicketStatus(ticket.status)}
                </span>
              </td>
              <td className="p-3">
                {ticket.createdAt && isValid(parseISO(ticket.createdAt))
                  ? format(parseISO(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                  : 'Date invalide'}
              </td>
              <td className="p-3">
                {ticket.image && (
                  <button
                    onClick={() => openLightbox(getImageUrl(ticket.image))}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <HiPhotograph className="w-6 h-6" />
                  </button>
                )}
              </td>
              <td className="p-3">
                {!isArchived && (
                  <button
                    onClick={() => handleArchiveTicket(ticket._id)}
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                    title="Archiver le ticket"
                  >
                    <HiArchive className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTicket(ticket._id, isArchived)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer le ticket"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={10} className="text-center py-4">Aucun ticket à afficher</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderGlobalStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total des tickets"
        value={globalStats.totalTickets}
        icon={<HiTicketIcon className="w-8 h-8" />}
        color="blue"
      />
      <StatCard
        title="Bons à vérifier"
        value={globalStats.vouchersToVerify}
        icon={<HiClipboardCheckIcon className="w-8 h-8" />}
        color="green"
      />
      <StatCard
        title="Utilisateurs Store"
        value={globalStats.storeUsers}
        icon={<HiOfficeBuildingIcon className="w-8 h-8" />}
        color="yellow"
      />
      <StatCard
        title="Utilisateurs District"
        value={globalStats.districtUsers}
        icon={<HiUserGroup className="w-8 h-8" />}
        color="purple"
      />
    </div>
  );

  // Composant pour les cartes de statistiques
  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:scale-105`}>
      <div>
        <h3 className={`text-${color}-800 text-lg font-semibold mb-2`}>{title}</h3>
        <p className={`text-${color}-600 text-3xl font-bold`}>{value}</p>
      </div>
      <div className={`bg-${color}-100 rounded-full p-4 text-${color}-500`}>
        {icon}
      </div>
    </div>
  );

  const handleProcessTransfer = async (transferId: string) => {
    try {
      const response = await api.put(`/transfers/${transferId}/process`);
      if (response.status === 200) {
        setTransfers(prevTransfers =>
          prevTransfers.map(transfer =>
            transfer._id === transferId ? { ...transfer, status: 'validated_and_processed' } : transfer
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du traitement du transfert:', error);
      setError("Erreur lors du traitement du transfert");
    }
  };

  const handleProcessCegidUser = async (userId: string) => {
    try {
      const response = await api.put(`/cegid-users/${userId}/process`);
      if (response.status === 200) {
        setCegidUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, status: 'validated_and_processed' } : user
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'utilisateur CEGID:', error);
      setError("Erreur lors du traitement de l'utilisateur CEGID");
    }
  };

  const handleSetUserLogin = async (userId: string, userLogin: string) => {
    try {
      const response = await api.put(`/cegid-users/${userId}/set-login`, { userLogin });
      // Mettre à jour la liste des utilisateurs
      setCegidUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? response.data : user
        )
      );
    } catch (error) {
      console.error('Erreur lors de la définition du User Login:', error);
    }
  };

  // Ajouter la fonction getPageTitle
  const getPageTitle = () => {
    switch (activeTab) {
      case 'users':
        return 'Gestion des Utilisateurs';
      case 'districts':
        return 'Gestion des Districts';
      case 'tickets':
        return 'Tickets Validés';
      case 'archivedTickets':
        return 'Tickets Archivés';
      case 'vouchers':
        return "Bons d'achat";
      case 'transfers':
        return 'Transferts';
      case 'cegidUsers':
        return 'Utilisateurs CEGID';
      default:
        return 'Tableau de bord Admin';
    }
  };

  // Ajouter cette fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Contenu principal avec marge à gauche pour la sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-[4.5rem]'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 pt-20"> {/* Ajout de pt-20 pour l'espacement en haut */}
          {renderHeader()}

          {/* Contenu principal */}
          <div className="space-y-6">
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'districts' && renderDistrictsTab()}
            {activeTab === 'tickets' && renderTicketsTab()}
            {activeTab === 'archivedTickets' && renderArchivedTicketsTab()}
            {activeTab === 'vouchers' && renderVouchersTab()}
            {activeTab === 'transfers' && renderTransfersTab()}
            {activeTab === 'cegidUsers' && renderCegidUsersTab()}
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Une seule notification globale */}
      <AnimatePresence>
        {showNotification && (
          <Notification
            message={notificationMessage}
            type={notificationType}
            onClose={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal d'édition */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <UserFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingUser(null);
              resetForm();
            }}
            onSubmit={handleUpdateUser}
            formData={{
              username,
              email,
              password,
              role
            }}
            setFormData={{
              setUsername,
              setEmail,
              setPassword,
              setRole
            }}
            editingUser={editingUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
