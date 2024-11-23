'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HiCheckCircle, HiXCircle, HiPhotograph, HiSearch } from 'react-icons/hi';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import api from '../../api';
import ProtectedRoute from '../../components/ProtectedRoute';
import DistrictDashboard from '../../components/DistrictDashboard';

type TicketType = 'delete' | 'modify';

interface Ticket {
  id: number;
  store: string;
  code: string;
  caissier: string;
  cause: string;
  type: TicketType;
  oldPaymentMethod?: string;
  newPaymentMethod?: string;
  amount?: number;
  image: string;
}

export default function DistrictPage() {
  return (
    <ProtectedRoute allowedRoles={['district']}>
      <DistrictDashboard />
    </ProtectedRoute>
  );
}
