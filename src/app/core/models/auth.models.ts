export type UserRole = 'CARPENTER' | 'CUSTOMER';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface LoginRequest { email: string; password: string; }

export interface AddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
}

export interface RegistrationRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: AddressRequest;
}

export type SessionResponse = CurrentUser;

