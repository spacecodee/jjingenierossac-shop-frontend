export interface CustomerDetailResponse {
  userId: number;
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  languageCode: string;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  daysSinceLastLogin: number | null;
  daysSinceRegistration: number;
  purchaseStats: PurchaseStats;
  recentReservations: RecentReservation[];
}

export interface PurchaseStats {
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  activeReservations: number;
  totalAmountSpent: number;
  averageTicket: number;
  lastPurchaseDate: string | null;
}

export interface RecentReservation {
  reservationId: number;
  reservationCode: string;
  createdAt: string;
  status: ReservationStatus;
  totalAmount: number;
  itemCount: number;
}

export type ReservationStatus =
  | 'RECEIVED'
  | 'IN_PROCESS'
  | 'READY_FOR_PICKUP'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED';
