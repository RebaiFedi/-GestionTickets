'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'district':
          router.push('/district');
          break;
        case 'store':
          router.push('/store');
          break;
        case 'consulting':
          router.push('/consulting');
          break;
        default:
          // Si le rôle n'est pas reconnu, on peut rediriger vers une page d'erreur ou laisser sur la page de connexion
          break;
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur n'est pas connecté, afficher le formulaire de connexion
  if (!user) {
    return <LoginForm />;
  }

  // Ce return ne devrait jamais être atteint en pratique, car l'utilisateur sera redirigé
  return null;
}
