export interface SavedAddress {
  id: string;
  label: 'Home' | 'Office' | 'Other' | string;
  completeAddress: string;
  address?: string;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  label: string;
  completeAddress: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  completeAddress?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
