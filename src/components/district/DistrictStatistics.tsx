import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Store, Package2, UserCheck, AlertTriangle, Calendar, Users, Award, BarChart2, Trash2, DollarSign, Activity, Edit, TrendingUp } from 'lucide-react';
import api from '../../api';
import CashierDetailsTable from './CashierDetailsTable';

interface StoreStats {
  name: string;
  totalTickets: number;
  deletions: number;
  modifications: number;
  pending: number;
  approved: number;
  rejected: number;
  cashiers: {
    name: string;
    deletions: number;
    modifications: number;
  }[];
  cashierDetailedStats: {
    name: string;
    deletions: number;
    modifications: number;
    totalTickets: number;
    totalAmount: number;
    lastActivity: string;
  }[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  percentage?: number;
  trend?: 'up' | 'down';
  subtitle?: string;
  details?: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

interface TimeFilter {
  period: 'today' | '7days' | '30days' | 'custom';
  startDate?: string;
  endDate?: string;
}

export default function DistrictStatistics() {
  const [stats, setStats] = useState<StoreStats[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ period: '30days' });
  const [sortField, setSortField] = useState('totalTickets');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchStats();
  }, [timeFilter]);

  const fetchStats = async () => {
    try {
      let url = '/tickets/store-stats';
      const params = new URLSearchParams();
      
      params.append('period', timeFilter.period);
      if (timeFilter.period === 'custom' && timeFilter.startDate && timeFilter.endDate) {
        params.append('startDate', timeFilter.startDate);
        params.append('endDate', timeFilter.endDate);
      }

      const response = await api.get(`${url}?${params.toString()}`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, percentage, trend, subtitle, details }: StatCardProps) => (
    <div className={`bg-white rounded-xl shadow-sm transition-all duration-300 p-6 relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-gray-600 text-base font-medium mb-2">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {percentage && trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {percentage}%
              </span>
              <span className="text-gray-500 text-sm ml-1">vs mois dernier</span>
            </div>
          )}
          {subtitle && (
            <p className="text-lg font-semibold text-gray-500 mt-1">{subtitle}</p>
          )}
          {details && (
            <p className="text-sm text-gray-400 mt-1">{details}</p>
          )}
        </div>
        <div className={`bg-${color}-100/50 p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const GlobalStats = () => {
    const totalTickets = stats.reduce((acc, store) => acc + store.totalTickets, 0);
    const totalDeletions = stats.reduce((acc, store) => acc + store.deletions, 0);
    const totalModifications = stats.reduce((acc, store) => acc + store.modifications, 0);

    // Trouver le magasin le plus actif
    const mostActiveStore = stats.reduce((max, store) => {
      const totalRequests = store.deletions + store.modifications;
      return totalRequests > (max.deletions + max.modifications) ? store : max;
    }, stats[0] || { name: 'N/A', deletions: 0, modifications: 0 });

    // Trouver le caissier le plus actif
    const mostActiveCashier = stats
      .flatMap(store => 
        store.cashierDetailedStats.map(cashier => ({
          ...cashier,
          storeName: store.name
        }))
      )
      .reduce((max, cashier) => {
        const totalOps = (cashier.deletions || 0) + (cashier.modifications || 0);
        const maxOps = (max.deletions || 0) + (max.modifications || 0);
        return totalOps > maxOps ? cashier : max;
      }, { name: 'N/A', deletions: 0, modifications: 0, storeName: 'N/A' });

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Première ligne : 3 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<Package2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />}
            color="orange"
          />
          <StatCard
            title="Suppressions"
            value={totalDeletions}
            icon={<AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />}
            color="red"
            percentage={((totalDeletions / totalTickets) * 100)}
          />
          <StatCard
            title="Modifications"
            value={totalModifications}
            icon={<Edit className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />}
            color="blue"
            percentage={((totalModifications / totalTickets) * 100)}
          />
        </div>

        {/* Deuxième ligne : 2 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Magasin le plus actif"
            value={mostActiveStore.name}
            icon={<Store className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />}
            color="purple"
            subtitle={`${mostActiveStore.deletions + mostActiveStore.modifications} opérations`}
            details={`${mostActiveStore.deletions} supp. / ${mostActiveStore.modifications} mod.`}
          />
          <StatCard
            title="Caissier le plus actif"
            value={mostActiveCashier.name}
            icon={<UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />}
            color="indigo"
            subtitle={mostActiveCashier.storeName}
            details={`${mostActiveCashier.deletions} supp. / ${mostActiveCashier.modifications} mod.`}
          />
        </div>
      </div>
    );
  };

  const StoreAnalytics = () => {
    // Filtrer les magasins avec au moins une opération
    const activeStores = stats.filter(store => 
      store.deletions > 0 || store.modifications > 0
    );

    return (
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
          <Store className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-orange-500" />
          Analyse des Magasins
        </h3>
        
        {activeStores.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {/* Performance des magasins */}
            <div className="hidden sm:block">
              <table className="w-full text-sm text-center text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Award className="w-3 h-3 mr-1 text-gray-500" />
                        Rang
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Store className="w-3 h-3 mr-1 text-gray-500" />
                        Nom du magasin
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Activity className="w-3 h-3 mr-1 text-gray-500" />
                        Opérations
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Trash2 className="w-3 h-3 mr-1 text-gray-500" />
                        Suppressions
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Edit className="w-3 h-3 mr-1 text-gray-500" />
                        Modifications
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                        Dernière activité
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeStores
                    .sort((a, b) => (b.deletions + b.modifications) - (a.deletions + a.modifications))
                    .slice(0, 5)
                    .map((store, index) => (
                      <tr key={store.name} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {store.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {store.deletions + store.modifications}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-semibold">
                          {((store.deletions / (store.deletions + store.modifications)) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-blue-600 font-semibold">
                          {((store.modifications / (store.deletions + store.modifications)) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-indigo-600 font-semibold">
                          {new Date(store.cashierDetailedStats[0]?.lastActivity || '').toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3 sm:space-y-4">
              {activeStores
                .sort((a, b) => (b.deletions + b.modifications) - (a.deletions + a.modifications))
                .slice(0, 5)
                .map((store, index) => (
                  <div key={store.name} className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          index === 3 ? 'bg-blue-50 text-blue-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="font-semibold text-gray-800">{store.name}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {store.deletions + store.modifications} opérations
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-500">Suppressions</div>
                        <div className="text-red-600 font-semibold">
                          {((store.deletions / (store.deletions + store.modifications)) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-500">Modifications</div>
                        <div className="text-blue-600 font-semibold">
                          {((store.modifications / (store.deletions + store.modifications)) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-500">Total</div>
                        <div className="text-green-600 font-semibold">
                          {store.deletions + store.modifications}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-indigo-50 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-500">Dernière activité</div>
                        <div className="text-indigo-600 font-semibold">
                          {new Date(store.cashierDetailedStats[0]?.lastActivity || '').toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 text-gray-500">
            Aucun magasin n'a d'opérations à afficher
          </div>
        )}
      </div>
    );
  };

  const CashierAnalytics = () => {
    // Filtrer les caissiers avec au moins une opération
    const activeCashierStats = stats.flatMap(store => 
      store.cashierDetailedStats
        .filter(cashier => cashier.deletions > 0 || cashier.modifications > 0)
        .map(cashier => ({
        ...cashier,
        storeName: store.name,
        totalOperations: cashier.deletions + cashier.modifications,
        averageAmount: cashier.totalAmount / (cashier.deletions + cashier.modifications),
        deleteRatio: (cashier.deletions + cashier.modifications) > 0 ? (cashier.deletions / (cashier.deletions + cashier.modifications)) * 100 : 0
      }))
    ).sort((a, b) => b.totalOperations - a.totalOperations);

    return (
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-orange-500" />
          Analyse des Caissiers
        </h3>
        
        {activeCashierStats.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {/* Performance des caissiers */}
            <div className="hidden sm:block">
              <table className="w-full text-sm text-center text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Award className="w-3 h-3 mr-1 text-gray-500" />
                        Rang
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <UserCheck className="w-3 h-3 mr-1 text-gray-500" />
                        Nom du caissier
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Store className="w-3 h-3 mr-1 text-gray-500" />
                        Magasin
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Activity className="w-3 h-3 mr-1 text-gray-500" />
                        Opérations
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Trash2 className="w-3 h-3 mr-1 text-gray-500" />
                        Suppressions
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Edit className="w-3 h-3 mr-1 text-gray-500" />
                        Modifications
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-500" />
                        Montant total
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <DollarSign className="w-3 h-3 mr-1 text-gray-500" />
                        Montant moyen
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                        Dernière activité
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeCashierStats.slice(0, 5).map((cashier, index) => (
                    <tr key={`${cashier.name}-${index}`} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {cashier.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {cashier.storeName}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {cashier.totalOperations}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-semibold">
                        {typeof cashier.deleteRatio === 'number' ? cashier.deleteRatio.toFixed(1) + '%' : '0%'}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-semibold">
                        {cashier.modifications}
                      </td>
                      <td className="px-6 py-4 text-yellow-600 font-semibold">
                        {typeof cashier.totalAmount === 'number' ? cashier.totalAmount.toFixed(0) + ' TND' : '0 TND'}
                      </td>
                      <td className="px-6 py-4 text-purple-600 font-semibold">
                        {typeof cashier.averageAmount === 'number' ? cashier.averageAmount.toFixed(0) + ' TND' : '0 TND'}
                      </td>
                      <td className="px-6 py-4 text-indigo-600 font-semibold">
                        {new Date(cashier.lastActivity).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3 sm:space-y-4">
              {activeCashierStats.slice(0, 5).map((cashier, index) => (
                <div key={`${cashier.name}-${index}`} className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        index === 3 ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{cashier.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{cashier.storeName}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {cashier.totalOperations} opérations
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-500">Suppressions</div>
                      <div className="text-red-600 font-semibold">
                        {typeof cashier.deleteRatio === 'number' ? cashier.deleteRatio.toFixed(1) + '%' : '0%'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-500">Modifications</div>
                      <div className="text-blue-600 font-semibold">
                        {cashier.modifications}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-500">Total</div>
                      <div className="text-green-600 font-semibold">
                        {cashier.totalOperations}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-500">Montant total</div>
                      <div className="text-yellow-600 font-semibold">
                        {typeof cashier.totalAmount === 'number' ? cashier.totalAmount.toFixed(0) + ' TND' : '0 TND'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-500">Montant moyen</div>
                      <div className="text-purple-600 font-semibold">
                        {typeof cashier.averageAmount === 'number' ? cashier.averageAmount.toFixed(0) + ' TND' : '0 TND'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-indigo-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-500">Dernière activité</div>
                      <div className="text-indigo-600 font-semibold">
                        {new Date(cashier.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 text-gray-500">
            Aucun caissier n'a d'opérations à afficher
          </div>
        )}
      </div>
    );
  };

  const TimeFilterSection = () => {
    // Formater la date d'aujourd'hui au format YYYY-MM-DD pour les inputs date
    const today = new Date().toISOString().split('T')[0];
    
    // Gérer le changement de période
    const handlePeriodChange = (value: TimeFilter['period']) => {
      if (value === 'custom') {
        setTimeFilter({
          period: value,
          startDate: today,
          endDate: today
        });
      } else {
        setTimeFilter({ period: value });
      }
    };

    // Gérer le changement de date de début
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStartDate = e.target.value;
      setTimeFilter(prev => ({
        ...prev,
        startDate: newStartDate,
        // Si la date de fin est antérieure à la nouvelle date de début, ajuster la date de fin
        endDate: prev.endDate && prev.endDate < newStartDate ? newStartDate : prev.endDate
      }));
    };

    // Gérer le changement de date de fin
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEndDate = e.target.value;
      setTimeFilter(prev => ({
        ...prev,
        endDate: newEndDate,
        // Si la date de début est postérieure à la nouvelle date de fin, ajuster la date de début
        startDate: prev.startDate && prev.startDate > newEndDate ? newEndDate : prev.startDate
      }));
    };

    return (
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-md font-semibold flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-orange-500" />
            Période d'analyse
          </h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {[
              { label: "Aujourd'hui", value: 'today' },
              { label: '7 derniers jours', value: '7days' },
              { label: '30 derniers jours', value: '30days' },
              { label: 'Personnalisé', value: 'custom' }
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handlePeriodChange(value as TimeFilter['period'])}
                className={`px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-sm font-medium transition-all duration-200 ${
                  timeFilter.period === value
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {timeFilter.period === 'custom' && (
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex flex-col space-y-2">
              <label className="text-sm sm:text-sm text-gray-600">Date de début</label>
              <input
                type="date"
                value={timeFilter.startDate || ''}
                onChange={handleStartDateChange}
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm sm:text-sm text-gray-600">Date de fin</label>
              <input
                type="date"
                value={timeFilter.endDate || ''}
                onChange={handleEndDateChange}
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <TimeFilterSection />
      <GlobalStats />
      <StoreAnalytics />
      <CashierAnalytics />
    </div>
  );
} 