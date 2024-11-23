'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { HiSearch, HiPhotograph, HiChartBar, HiClipboardList, HiClipboardCheck, HiTicket, HiX } from 'react-icons/hi'
import { publicApi, getImageUrl } from '../api'
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface Ticket {
  _id: string
  store: {
    _id: string
    name: string
    district?: {
      _id: string
      name: string
    }
  }
  code: string
  caissier: string
  type: 'delete' | 'modify'
  cause?: string
  oldPaymentMethod?: string
  newPaymentMethod?: string
  amount?: number
  status: 'pending' | 'approved' | 'rejected' | 'validated_and_processed' | 'cancelled'
  image?: string
  createdAt: string
}

interface Stats {
  totalTickets: number
  validatedTickets: number
  validatedAndProcessedTickets: number
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export default function ConsultingDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalTickets: 0,
    validatedTickets: 0,
    validatedAndProcessedTickets: 0
  })
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await publicApi.get('/tickets/consulting')
      setTickets(response.data)
      calculateStats(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error)
      setError("Erreur lors de la récupération des tickets")
    }
  }

  const calculateStats = (tickets: Ticket[]) => {
    const totalTickets = tickets.length
    const validatedTickets = tickets.filter(ticket => ticket.status === 'approved').length
    const validatedAndProcessedTickets = tickets.filter(ticket => ticket.status === 'validated_and_processed').length
    setStats({ totalTickets, validatedTickets, validatedAndProcessedTickets })
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => 
      ticket.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.code.includes(searchTerm) ||
      ticket.caissier.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [tickets, searchTerm])

  const openLightbox = (imageUrl: string) => {
    setCurrentImage(imageUrl)
    setLightboxOpen(true)
  }

  const renderTicketStatus = (status: string) => {
    switch (status) {
      case 'approved': return 'Validé'
      case 'rejected': return 'Refusé'
      case 'validated_and_processed': return 'Validé et traité'
      case 'cancelled': return 'Annulé'
      default: return 'En cours'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-orange-600 mb-12">Tableau de bord Consulting</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard 
            title="Total des tickets" 
            value={stats.totalTickets} 
            icon={<HiTicket className="w-10 h-10 text-orange-500" />}
          />
          <StatCard 
            title="Tickets validés" 
            value={stats.validatedTickets} 
            icon={<HiClipboardCheck className="w-10 h-10 text-orange-500" />}
          />
          <StatCard 
            title="Validés et traités" 
            value={stats.validatedAndProcessedTickets} 
            icon={<HiClipboardList className="w-10 h-10 text-orange-500" />}
          />
        </div>

        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="Rechercher par magasin, code ou caissier..."
            className="w-full bg-white border-2 border-orange-200 rounded-full py-3 px-6 pl-12 focus:outline-none focus:border-orange-400 transition-colors duration-300 shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 text-xl" />
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-100">
                  <th className="p-4 font-semibold text-orange-800">Magasin</th>
                  <th className="p-4 font-semibold text-orange-800">District</th>
                  <th className="p-4 font-semibold text-orange-800">Code</th>
                  <th className="p-4 font-semibold text-orange-800">Caissier</th>
                  <th className="p-4 font-semibold text-orange-800">Type</th>
                  <th className="p-4 font-semibold text-orange-800">Statut</th>
                  <th className="p-4 font-semibold text-orange-800">Date de création</th>
                  <th className="p-4 font-semibold text-orange-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTickets.map((ticket) => (
                    <motion.tr
                      key={ticket._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-orange-100 hover:bg-orange-50 transition-colors duration-300"
                    >
                      <td className="p-4">{ticket.store.name}</td>
                      <td className="p-4">{ticket.store.district ? ticket.store.district.name : 'N/A'}</td>
                      <td className="p-4">{ticket.code}</td>
                      <td className="p-4">{ticket.caissier}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.type === 'delete' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.type === 'delete' ? 'Suppression' : 'Modification'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'approved' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          ticket.status === 'validated_and_processed' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {renderTicketStatus(ticket.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-orange-500 hover:text-orange-700 transition-colors duration-300 mr-2"
                        >
                          Détails
                        </button>
                        {ticket.image && (
                          <button
                            onClick={() => openLightbox(getImageUrl(ticket.image))}
                            className="text-orange-500 hover:text-orange-700 transition-colors duration-300"
                          >
                            <HiPhotograph className="w-6 h-6 inline" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {filteredTickets.length === 0 && (
          <p className="text-center text-gray-500 mt-8 text-xl">Aucun ticket trouvé</p>
        )}

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-orange-600">Détails du ticket</h2>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-gray-700">
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>Magasin:</strong> {selectedTicket.store.name}</p>
                <p><strong>District:</strong> {selectedTicket.store.district ? selectedTicket.store.district.name : 'N/A'}</p>
                <p><strong>Code:</strong> {selectedTicket.code}</p>
                <p><strong>Caissier:</strong> {selectedTicket.caissier}</p>
                <p><strong>Type:</strong> {selectedTicket.type === 'delete' ? 'Suppression' : 'Modification'}</p>
                <p><strong>Statut:</strong> {renderTicketStatus(selectedTicket.status)}</p>
                {selectedTicket.type === 'delete' ? (
                  <p><strong>Cause:</strong> {selectedTicket.cause}</p>
                ) : (
                  <>
                    <p><strong>Ancien mode de paiement:</strong> {selectedTicket.oldPaymentMethod}</p>
                    <p><strong>Nouveau mode de paiement:</strong> {selectedTicket.newPaymentMethod}</p>
                    <p><strong>Montant:</strong> {selectedTicket.amount} TND</p>
                  </>
                )}
                <p><strong>Date de création:</strong> {format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: currentImage }]}
      />
    </div>
  )
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between border-l-4 border-orange-500"
    >
      <div>
        <h3 className="text-orange-800 text-lg font-semibold mb-2">{title}</h3>
        <p className="text-orange-600 text-3xl font-bold">{value}</p>
      </div>
      <div className="bg-orange-100 rounded-full p-4">
        {icon}
      </div>
    </motion.div>
  )
}
