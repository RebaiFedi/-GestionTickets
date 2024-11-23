'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../../components/AdminDashboard';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');  // Redirection vers la page d'accueil
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <AdminDashboard />;
}
