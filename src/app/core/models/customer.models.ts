export interface CustomerProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
}

export interface CustomerProfileUpdateRequest {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
}
