export interface CegidUser {
    _id: string;
    fullName: string;
    userGroup: string;
    userLogin?: string;
    store: {
        _id: string;
        name: string;
    };
    status: 'pending' | 'completed' | 'validated_and_processed' | 'cancelled' | 'rejected';
    createdAt: string;
}

export type CegidUserSortOption = 'newest' | 'oldest' | 'pending';

export interface Ticket {
    _id: string;
    code: string;
    caissier: string;
    type: 'delete' | 'modify';
    status: string;
    store: {
        _id: string;
        name: string;
    };
    cause?: string;
    oldPaymentMethod: string;
    newPaymentMethod: string;
    oldPaymentMethod2?: string;
    newPaymentMethod2?: string;
    amount?: number;
    image?: string;
    createdAt: string;
    dateTicket: string;
}

export interface CashierDetail {
    name: string;
    storeName: string;
    store?: {
        name: string;
    };
    deletions: number;
    modifications: number;
    totalTickets: number;
    totalAmount: number;
}

export interface DistrictTransfer {
    _id: string;
    transferNumber: string;
    quantity: number;
    date: string;
    destination: string;
    status: 'pending' | 'completed' | 'cancelled' | 'validated_and_processed';
    createdAt: string;
    store: {
        _id: string;
        name: string;
    };
}
