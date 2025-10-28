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
  failedLoginAttempts: number;
  lockedUntil: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  daysSinceLastLogin: number | null;
  daysSinceRegistration: number;
}
