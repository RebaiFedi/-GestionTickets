export type TicketType = 'delete' | 'modify';
export type TabType = 'tickets' | 'vouchers' | 'transfers' | 'cegidUsers' | 'statistics';
export type VoucherSortOption = 'newest' | 'oldest' | 'pending' | 'validated' | 'rejected';
export type TransferSortOption = 'newest' | 'oldest' | 'pending' | 'completed' | 'cancelled';
export type CegidUserSortOption = 'newest' | 'oldest' | 'pending' | 'completed' | 'validated_and_processed';
export type TicketSortOption = 'newest' | 'oldest' | 'pending' | 'validated' | 'processed';

export interface Ticket {
  _id: string;
  code: string;
  caissier: string;
  type: TicketType;
  cause?: string;
  oldPaymentMethod?: string;
  newPaymentMethod?: string;
  oldPaymentMethod2?: string;
  newPaymentMethod2?: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'validated_and_processed' | 'cancelled';
  image?: string;
  createdAt: string;
  dateTicket: string;
}

export interface Voucher {
  _id: string;
  voucherNumber: string;
  amount: number;
  fullName: string;
  cin: string;
  voucherType: string;
  voucherDate?: string;
  image?: string;
  createdAt?: string;
  status: string;
}

export interface VoucherVerification {
  voucherNumber: string;
  amount: number;
  image: File | null;
  fullName: string;
  cin: string;
  voucherType: string;
  voucherDate: string;
}

export interface Transfer {
  _id: string;
  transferNumber: string;
  quantity: number;
  date: string;
  destination: string;
  store: {
    _id: string;
    name: string;
  } | null;
  status: string;
  createdAt: string;
}

export interface TransferFormData {
  transferNumber: string;
  quantity: number;
  date: string;
  destination: string;
}

export interface CegidUser {
  _id: string;
  fullName: string;
  userGroup: string;
  userLogin?: string;
  store: {
    _id: string;
    name: string;
  } | null;
  status: "pending" | "completed" | "validated_and_processed" | "cancelled" | "rejected";
  createdAt: string;
}

// Modifier l'interface pour le formulaire de création
interface CegidUserFormData {
  fullName: string;
  userGroup: string;
  // userLogin retiré car il sera géré par l'admin
}
