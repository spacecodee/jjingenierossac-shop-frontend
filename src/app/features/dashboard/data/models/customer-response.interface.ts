export interface CustomerResponse {
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
  lastLoginAt: string | null;
  createdAt: string;
  isLocked: boolean;
  lockedUntil: string | null;
}
