'use client'

import React, { useState, useEffect } from 'react'
import { Menu, Ticket as TicketIcon, ClipboardCheck, ArrowLeftRight, Users, CheckCircle, XCircle, X, Trash2, Edit, Receipt, Plus, Clock } from 'lucide-react'
import { Search } from 'lucide-react'
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

import api, { getImageUrl } from '../api'
import { useAuth } from '../context/AuthContext'
import StoreSidebar from './store/StoreSidebar'
import StoreTicketList from './store/StoreTicketList'
import StoreVoucherList from './store/StoreVoucherList'
import StoreTicketForm from './store/StoreTicketForm'
import StoreVoucherForm from './store/StoreVoucherForm'
import StoreTransferList from './store/StoreTransferList'
import StoreTransferForm from './store/StoreTransferForm'
import StoreCegidUserForm from './store/StoreCegidUserForm'
import StoreCegidUserList from './store/StoreCegidUserList'
import type { 
  TabType, 
  TicketType, 
  Transfer, 
  TransferFormData, 
  VoucherVerification, 
  Voucher,
  Ticket,
  VoucherSortOption,
  TransferSortOption,
  CegidUserSortOption,
  CegidUser,
  TicketSortOption
} from './store/types'
import Navbar from './Navbar'

// Liste des modes de paiement (garder cette partie)
const paymentMethods = [
  "Bon Achat GIFT",
  "American Express",
  "Arrhes déja versées  ECommerce",
  "Arrhes déjà versé",
  "Carte Bancaire ATB",
  "Avoir ECommerce",
  "Contre Bon Article",
  "Carte Cadeau",
  "BON ACHATS FIDELITE",
  "Bon Achat Marketing",
  "Carte Bancaire Banque de L'HABITAT",
  "Bon Cadeaux",
  "Bon Marché EXTERNE",
  "Bon Marché HA",
  "Bon Achat Cadeau",
  "TPE Amen Banque",
  "Carte Bancaire Albaraka",
  "Contre Bon Cadeaux",
  "Carte Bancaire Amen Banque",
  "Contre Bon Marché",
  "Carte bancaire TQB",
  "Carte Bancaire ECommerce",
  "Carte Bancaire Attijari Bank",
  "SMT SITEWEB",
  "CONTRE BON CONVENTION",
  "Carte Bancaire Zitouna Banque",
  "Contre Bon Chaussure",
  "Chèque différé",
  "Contre Bon Marketing",
  "Bon d'achat condition commerciale",
  "BON ACHAT CONVENTION",
  "Chèque",
  "Divers",
  "Ecart de change",
  "Ecart de caisse",
  "Espece Ecommerce",
  "E-DINAR POSTE",
  "Espèces Dinars",
  "GIFT TENUE STAFF HA",
  "Retenue à la source",
  "Remise sur Bon achat et Convention",
  "TPE SODEXO",
  "Traite acceptée",
  "Virement Bancaire"
]

// Composant SearchBar réutilisable avec style modifié
const SearchBar = ({ placeholder, value, onChange }: { 
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full py-4 pl-12 pr-4 text-gray-600 bg-white rounded-lg border-2 border-gray-100 outline-none focus:border-orange-500 transition-all duration-200 shadow-sm"
    />
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <Search className="w-5 h-5 text-gray-400" />
    </div>
    {value && (
      <button
        onClick={() => onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        <XCircle className="w-5 h-5" />
      </button>
    )}
  </div>
);

export default function StoreDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('tickets')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [ticketType, setTicketType] = useState<TicketType>('delete')
  const [code, setCode] = useState('')
  const [caissier, setCaissier] = useState('')
  const [cause, setCause] = useState('')
  const [oldPaymentMethod, setOldPaymentMethod] = useState('')
  const [newPaymentMethod, setNewPaymentMethod] = useState('')
  const [amount, setAmount] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false)
  const [isVoucherFormOpen, setIsVoucherFormOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [voucherSearchTerm, setVoucherSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [ticketsPerPage, setTicketsPerPage] = useState(10)
  const [currentVoucherPage, setCurrentVoucherPage] = useState(1)
  const [vouchersPerPage, setVouchersPerPage] = useState(10)
  const [totalVoucherPages, setTotalVoucherPages] = useState(1)
  const [ticketFormError, setTicketFormError] = useState<string | null>(null)
  const [voucherFormError, setVoucherFormError] = useState<string | null>(null)
  const [dateTicket, setDateTicket] = useState('')
  const [oldPaymentMethod2, setOldPaymentMethod2] = useState('')
  const [newPaymentMethod2, setNewPaymentMethod2] = useState('')
  const [showSecondPaymentMethod, setShowSecondPaymentMethod] = useState(false)
  const [voucherVerification, setVoucherVerification] = useState<VoucherVerification>({
    voucherNumber: '',
    amount: 0,
    image: null,
    fullName: '',
    cin: '',
    voucherType: '',
    voucherDate: '',
  })
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false)
  const [transferFormError, setTransferFormError] = useState<string | null>(null)
  const [transferData, setTransferData] = useState<TransferFormData>({
    transferNumber: '',
    quantity: 0,
    date: '',
    destination: ''
  })
  const [transferSearchTerm, setTransferSearchTerm] = useState('')
  const [currentTransferPage, setCurrentTransferPage] = useState(1)
  const [transfersPerPage, setTransfersPerPage] = useState(10)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isCegidUserFormOpen, setIsCegidUserFormOpen] = useState(false);
  const [cegidUserData, setCegidUserData] = useState({
    fullName: '',
    userGroup: ''
  });
  const [cegidUserFormError, setCegidUserFormError] = useState<string | null>(null);
  const [cegidUsers, setCegidUsers] = useState<CegidUser[]>([]);
  const [currentCegidUserPage, setCurrentCegidUserPage] = useState(1);
  const [cegidUsersPerPage, setCegidUsersPerPage] = useState(10);
  const [sortOption, setSortOption] = useState<TicketSortOption>('newest');
  const [voucherSortOption, setVoucherSortOption] = useState<VoucherSortOption>('newest');
  const [transferSortOption, setTransferSortOption] = useState<TransferSortOption>('newest');
  const [cegidUserSortOption, setCegidUserSortOption] = useState<CegidUserSortOption>('newest');

  useEffect(() => {
    if (user) {
      fetchTickets()
      fetchVouchers()
      fetchTransfers()
      fetchCegidUsers()
    }
  }, [user])

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets')
      setTickets(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error)
      setError("Erreur lors de la récupération des tickets")
    }
  }

  const fetchVouchers = async () => {
    try {
      const response = await api.get('/tickets/vouchers/store')
      setVouchers(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des bons d\'achat:', error)
      setError("Erreur lors de la récupération des bons d'achat")
    }
  }

  const fetchTransfers = async () => {
    try {
      const response = await api.get('/transfers')
      setTransfers(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des transferts:', error)
      setError("Erreur lors de la récupération des transferts")
    }
  }

  const fetchCegidUsers = async () => {
    try {
      const response = await api.get('/cegid-users');
      setCegidUsers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs CEGID:', error);
      setError("Erreur lors de la récupération des utilisateurs CEGID");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('code', code);
    formData.append('caissier', caissier);
    formData.append('type', ticketType);
    formData.append('dateTicket', dateTicket);
    
    // Assurez-vous que le montant est un nombre valide
    if (amount) {
      formData.append('amount', amount.toString());
    }
    
    if (ticketType === 'delete') {
      formData.append('cause', cause);
    } else {
      formData.append('oldPaymentMethod', oldPaymentMethod);
      formData.append('newPaymentMethod', newPaymentMethod);
      if (showSecondPaymentMethod) {
        formData.append('oldPaymentMethod2', oldPaymentMethod2);
        formData.append('newPaymentMethod2', newPaymentMethod2);
      }
    }
    
    if (image) {
      formData.append('image', image);
    }

    try {
      console.log('Données envoyées:', Object.fromEntries(formData)); // Pour le débogage
      const response = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Réponse du serveur:', response.data); // Pour le débogage
      setTickets(prevTickets => [response.data, ...prevTickets]);
      return Promise.resolve(); // Important pour que le loading et le message de succès fonctionnent
    } catch (error: any) {
      setTicketFormError("Erreur lors de la création du ticket");
      return Promise.reject(error); // Important pour gérer l'erreur dans le formulaire
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('voucherNumber', voucherVerification.voucherNumber);
      formData.append('amount', voucherVerification.amount.toString());
      formData.append('fullName', voucherVerification.fullName);
      formData.append('cin', voucherVerification.cin);
      formData.append('voucherType', voucherVerification.voucherType);
      formData.append('voucherDate', voucherVerification.voucherDate);
      if (voucherVerification.image) {
        formData.append('image', voucherVerification.image);
      }

      const response = await api.post('/tickets/vouchers/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Mettre à jour la liste des bons d'achat
      setVouchers(prevVouchers => [response.data, ...prevVouchers]);

      // Réinitialiser le formulaire sauf le numéro du bon
      setVoucherVerification(prev => ({
        ...prev,
        amount: 0,
        fullName: '',
        cin: '',
        voucherType: '',
        voucherDate: '',
        image: null
      }));

      return Promise.resolve();
    } catch (error: any) {
      setVoucherFormError(error.response?.data?.msg || "Erreur lors de la vérification du bon");
      return Promise.reject(error);
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, { status: 'cancelled' })
      if (response.status === 200) {
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket._id === ticketId ? { ...ticket, status: 'cancelled' } : ticket
          )
        )
        setError(null)
      }
    } catch (error: any) {
      setError("Erreur lors de l'annulation du ticket")
    }
  }

  const resetTicketForm = () => {
    setCode('')
    setCaissier('')
    setCause('')
    setOldPaymentMethod('')
    setNewPaymentMethod('')
    setAmount('') // Réinitialiser le montant
    setImage(null)
    setTicketType('delete')
    setDateTicket('')
    setOldPaymentMethod2('')
    setNewPaymentMethod2('')
    setShowSecondPaymentMethod(false)
  }

  const resetVoucherForm = () => {
    setVoucherVerification({
      voucherNumber: '',
      amount: 0,
      image: null,
      fullName: '',
      cin: '',
      voucherType: '',
      voucherDate: '',
    })
  }

  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl)
    setLightboxOpen(true)
  }

  const handlePrintVoucher = async (voucherId: string) => {
    try {
      const response = await api.get(`/tickets/vouchers/${voucherId}/pdf`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      link.setAttribute('download', `voucher_${voucherId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      setError("Erreur lors du téléchargement du PDF")
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/transfers', transferData);
      setTransfers(prevTransfers => [response.data, ...prevTransfers]);
      setTransferData({
        transferNumber: '',
        quantity: 0,
        date: '',
        destination: ''
      });
      fetchTransfers();
      return Promise.resolve(); // Important pour le message de succès
    } catch (error: any) {
      setTransferFormError(error.response?.data?.msg || "Erreur lors de la création du transfert");
      return Promise.reject(error);
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    try {
      const response = await api.put(`/transfers/${transferId}/status`, { status: 'cancelled' })
      if (response.status === 200) {
        setTransfers(prevTransfers => 
          prevTransfers.map(transfer => 
            transfer._id === transferId ? { ...transfer, status: 'cancelled' } : transfer
          )
        )
        setError(null)
      }
    } catch (error: any) {
      setError("Erreur lors de l'annulation du transfert")
    }
  }

  const handleCegidUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ajouter un userLogin temporaire unique
      const dataToSubmit = {
        ...cegidUserData,
        userLogin: `temp_${Date.now()}`  // Ajouter un userLogin temporaire unique
      };
      
      const response = await api.post('/cegid-users', dataToSubmit);
      setCegidUsers(prevUsers => [response.data, ...prevUsers]);
      setCegidUserData({
        fullName: '',
        userGroup: ''
      });
      setCegidUserFormError(null);
      return Promise.resolve();
    } catch (error: any) {
      setCegidUserFormError(error.response?.data?.msg || "Erreur lors de la création de l'utilisateur");
      return Promise.reject(error);
    }
  };

  const handleCancelCegidUser = async (id: string) => {
    try {
      const response = await api.put(`/cegid-users/${id}/cancel`);
      if (response.status === 200) {
        setCegidUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === id ? { ...user, status: 'cancelled' as const } : user
          )
        );
        setError(null);
      }
    } catch (error: any) {
      setError("Erreur lors de l'annulation de l'utilisateur");
    }
  };

  // Fonction pour déterminer le titre de la page en fonction de l'onglet actif
  const getPageTitle = () => {
    switch (activeTab) {
      case 'tickets':
        return 'Demande de suppression/modification ticket'
      case 'vouchers':
        return 'Demande de vérification bon d\'achat'
      case 'transfers':
        return 'Demande de suppression transfert'
      case 'cegidUsers':
        return 'Demande de creation Utilisateurs CEGID'
      default:
        return 'Tableau de bord'
    }
  }

  // Nouveau composant StatCard avec un design plus moderne
  function StatCard({ title, value, icon, color }: { 
    title: string, 
    value: number, 
    icon: React.ReactNode, 
    color: string
  }) {
    return (
      <div className={`
        bg-white 
        rounded-xl 
        shadow-sm 
        hover:shadow-lg 
        transition-all 
        duration-300 
        p-6 
        relative 
        overflow-hidden
        group
      `}>
        <div className="flex items-start justify-between">
          <div className="relative z-10">
            <p className="text-gray-600 text-base font-medium mb-2">{title}</p>
            <p className={`text-4xl font-bold text-${color}-600`}>{value}</p>
          </div>
          <div className={`
            bg-${color}-100/50 
            p-3 
            rounded-xl 
            group-hover:scale-110 
            transition-transform 
            duration-300
          `}>
            {icon}
          </div>
        </div>
      </div>
    )
  }

  // Fonction pour rendre les statistiques des tickets
  const renderTicketStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Tickets en cours"
        value={tickets.filter(t => t.status === 'pending').length}
        icon={<TicketIcon className="w-8 h-8 text-orange-500" />}
        color="orange"
      />
      <StatCard
        title="Tickets valids"
        value={tickets.filter(t => t.status === 'approved').length}
        icon={<ClipboardCheck className="w-8 h-8 text-green-500" />}
        color="green"
      />
      <StatCard
        title="Validés et traités"
        value={tickets.filter(t => t.status === 'validated_and_processed').length}
        icon={<ArrowLeftRight className="w-8 h-8 text-blue-500" />}
        color="blue"
      />
    </div>
  );

  // Fonction pour rendre les statistiques des bons d'achat
  const renderVoucherStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Bons en attente"
          value={vouchers.filter(v => v.status === 'pending').length}
          icon={<ClipboardCheck className="w-8 h-8 text-orange-500" />}
          color="orange"
        />
        <StatCard
          title="Bons validés"
          value={vouchers.filter(v => v.status === 'validated').length}
          icon={<CheckCircle className="w-8 h-8 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Bons refusés"
          value={vouchers.filter(v => v.status === 'rejected').length}
          icon={<XCircle className="w-8 h-8 text-red-500" />}
          color="red"
        />
      </div>
    );
  };

  // Fonction pour rendre les statistiques des transferts
  const renderTransferStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Transferts en cours"
        value={transfers.filter(t => t.status === 'pending').length}
        icon={<ArrowLeftRight className="w-8 h-8 text-orange-500" />}
        color="orange"
      />
      <StatCard
        title="Transferts validés"
        value={transfers.filter(t => t.status === 'completed').length} // Changé de 'validated' à 'completed'
        icon={<CheckCircle className="w-8 h-8 text-green-500" />}
        color="green"
      />
      <StatCard
        title="Transferts traités"
        value={transfers.filter(t => t.status === 'validated_and_processed').length}
        icon={<ArrowLeftRight className="w-8 h-8 text-blue-500" />}
        color="blue"
      />
    </div>
  );

  // Calculer le nombre total de pages lorsque les tickets ou la recherche changent
  useEffect(() => {
    const filteredTickets = tickets.filter(ticket =>
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.caissier.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setTotalPages(Math.ceil(filteredTickets.length / ticketsPerPage));
  }, [tickets, searchTerm, ticketsPerPage]);

  // Calcul du nombre total de pages pour les bons d'achat
  useEffect(() => {
    const filteredVouchers = vouchers.filter(voucher =>
      voucher.voucherNumber.toLowerCase().includes(voucherSearchTerm.toLowerCase())
    );
    setTotalVoucherPages(Math.ceil(filteredVouchers.length / vouchersPerPage));
  }, [vouchers, voucherSearchTerm, vouchersPerPage]);

  // Ajouter cette fonction pour rendre les statistiques des utilisateurs CEGID
  const renderCegidUserStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Utilisateurs en attente"
        value={cegidUsers.filter(t => t.status === 'pending').length}
        icon={<Clock className="w-8 h-8 text-orange-500" />}
        color="orange"
      />
      <StatCard
        title="Utilisateurs validés"
        value={cegidUsers.filter(t => t.status === 'completed').length}
        icon={<CheckCircle className="w-8 h-8 text-green-500" />}
        color="green"
      />
      <StatCard
        title="Utilisateurs traités"
        value={cegidUsers.filter(t => t.status === 'validated_and_processed').length}
        icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
        color="blue"
      />
    </div>
  );

  // Ajouter cette fonction pour gérer le changement d'onglet
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Faire défiler la page vers le haut
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 pt-16">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <StoreSidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      <main className="flex-1 px-4 lg:px-8 pb-8 pt-4 overflow-auto" id="main-content">
        <div className="max-w-7xl mx-auto">
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
              <span className="text-sm">HA {user?.username?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>

          {/* Afficher les statistiques en fonction de l'onglet actif */}
          {activeTab === 'tickets' && renderTicketStats()}
          {activeTab === 'vouchers' && renderVoucherStats()}
          {activeTab === 'transfers' && renderTransferStats()}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p className="font-bold">Erreur</p>
              <p>{error}</p>
            </div>
          )}

          {activeTab === 'tickets' && (
            <>
              {/* Boutons d'action adaptatifs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => {
                    setTicketType('delete')
                    setIsTicketFormOpen(true)
                  }}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">Demande de suppression</span>
                </button>

                <button
                  onClick={() => {
                    setTicketType('modify')
                    setIsTicketFormOpen(true)
                  }}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  <span className="font-medium">Demande de modification</span>
                </button>
              </div>

              <StoreTicketList
                tickets={tickets}
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
                handleCancelTicket={handleCancelTicket}
                openLightbox={openLightbox}
                getImageUrl={getImageUrl}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentPage={currentPage}
                ticketsPerPage={ticketsPerPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                setTicketsPerPage={setTicketsPerPage}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </>
          )}

          {activeTab === 'vouchers' && (
            <>
              {/* Bouton d'action adaptatif */}
              <div className="mb-8">
                <button
                  onClick={() => setIsVoucherFormOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <Receipt className="w-5 h-5 mr-2" />
                  <span className="font-medium">Vérifier un bon d'achat</span>
                </button>
              </div>

              <StoreVoucherList
                vouchers={vouchers}
                openLightbox={openLightbox}
                handlePrintVoucher={handlePrintVoucher}
                getImageUrl={getImageUrl}
                setError={setError}
                voucherSearchTerm={voucherSearchTerm}
                setVoucherSearchTerm={setVoucherSearchTerm}
                currentVoucherPage={currentVoucherPage}
                vouchersPerPage={vouchersPerPage}
                setCurrentVoucherPage={setCurrentVoucherPage}
                totalVoucherPages={totalVoucherPages}
                setVouchersPerPage={setVouchersPerPage}
                sortOption={voucherSortOption}
                setSortOption={setVoucherSortOption}
              />
            </>
          )}

          {activeTab === 'transfers' && (
            <>
              {/* Bouton d'action adaptatif */}
              <div className="mb-8">
                <button
                  onClick={() => setIsTransferFormOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    <span className="hidden sm:inline">Demande de suppression transfert</span>
                    <span className="sm:hidden">Supprimer transfert</span>
                  </span>
                </button>
              </div>

              <StoreTransferList
                transfers={transfers}
                searchTerm={transferSearchTerm}
                setSearchTerm={setTransferSearchTerm}
                currentPage={currentTransferPage}
                transfersPerPage={transfersPerPage}
                handleCancelTransfer={handleCancelTransfer}
                setCurrentPage={setCurrentTransferPage} // Ajouter cette prop
                totalPages={Math.ceil(transfers.length / transfersPerPage)} // Ajouter cette prop
                setTransfersPerPage={setTransfersPerPage} // Ajouter cette prop
                sortOption={transferSortOption}
                setSortOption={setTransferSortOption}
              />
            </>
          )}

          {activeTab === 'cegidUsers' && (
            <>
              {renderCegidUserStats()}
              
              {/* Bouton d'action adaptatif */}
              <div className="mb-8">
                <button
                  onClick={() => setIsCegidUserFormOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  <span className="font-medium">Nouvel utilisateur CEGID</span>
                </button>
              </div>

              <StoreCegidUserList
                users={cegidUsers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                currentPage={currentCegidUserPage}
                usersPerPage={cegidUsersPerPage}
                handleDeleteUser={handleCancelCegidUser} // Renommer cette prop si vous voulez
                setCurrentPage={setCurrentCegidUserPage}
                totalPages={Math.ceil(cegidUsers.length / cegidUsersPerPage)}
                setUsersPerPage={setCegidUsersPerPage}
                sortOption={cegidUserSortOption}
                setSortOption={setCegidUserSortOption}
              />

              {isCegidUserFormOpen && (
                <StoreCegidUserForm
                  isOpen={isCegidUserFormOpen}
                  onClose={() => setIsCegidUserFormOpen(false)}
                  userData={cegidUserData}
                  setUserData={setCegidUserData}
                  handleSubmit={handleCegidUserSubmit}
                  formError={cegidUserFormError}
                />
              )}
            </>
          )}
        </div>
      </main>

      {isTicketFormOpen && (
        <StoreTicketForm
          isOpen={isTicketFormOpen}
          onClose={() => setIsTicketFormOpen(false)}
          ticketType={ticketType}
          code={code}
          setCode={setCode}
          caissier={caissier}
          setCaissier={setCaissier}
          cause={cause}
          setCause={setCause}
          oldPaymentMethod={oldPaymentMethod}
          setOldPaymentMethod={setOldPaymentMethod}
          newPaymentMethod={newPaymentMethod}
          setNewPaymentMethod={setNewPaymentMethod}
          oldPaymentMethod2={oldPaymentMethod2}
          setOldPaymentMethod2={setOldPaymentMethod2}
          newPaymentMethod2={newPaymentMethod2}
          setNewPaymentMethod2={setNewPaymentMethod2}
          amount={amount}
          setAmount={setAmount}
          dateTicket={dateTicket}
          setDateTicket={setDateTicket}
          showSecondPaymentMethod={showSecondPaymentMethod}
          setShowSecondPaymentMethod={setShowSecondPaymentMethod}
          setImage={setImage}
          handleSubmit={handleSubmit}
          paymentMethods={paymentMethods}
          ticketFormError={ticketFormError}
        />
      )}

      {isVoucherFormOpen && (
        <StoreVoucherForm
          isOpen={isVoucherFormOpen}
          onClose={() => setIsVoucherFormOpen(false)}
          voucherVerification={voucherVerification}
          setVoucherVerification={setVoucherVerification}
          handleVoucherSubmit={handleVoucherSubmit}
          voucherFormError={voucherFormError}
        />
      )}

      {isTransferFormOpen && (
        <StoreTransferForm
          isOpen={isTransferFormOpen}
          onClose={() => setIsTransferFormOpen(false)}
          transferData={transferData}
          setTransferData={setTransferData}
          handleSubmit={handleTransferSubmit}
          transferFormError={transferFormError}
        />
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: currentImage }]}
      />
    </div>
  )
}
