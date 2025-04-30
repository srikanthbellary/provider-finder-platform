/**
 * Provider-related interfaces matching backend DTOs
 */

// Location information
export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
}

// Provider information
export interface Provider {
  id: number;
  name: string;
  providerType?: string;
  locations: Location[];
  specialties?: string[];
  languages?: string[];
  isVerified?: boolean;
  isRegistered?: boolean;
  description?: string;
  imageUrl?: string;
  rating?: number;
}

// Provider search response from the backend
export interface ProviderSearchResponse {
  providers: Provider[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  viewportMetadata: ViewportMetadata;
}

// Viewport metadata from the backend
export interface ViewportMetadata {
  providersInViewport: number;
}

// Provider search request to be sent to the backend
export interface ProviderSearchRequest {
  northLat: number;
  southLat: number;
  eastLng: number;
  westLng: number;
  searchTerm?: string;
  specialtyIds?: number[];
  providerTypeIds?: number[];
  languageIds?: number[];
  isVerifiedOnly?: boolean;
  isRegisteredOnly?: boolean;
  page?: number;
  pageSize?: number;
  userLat?: number;
  userLng?: number;
  sortBy?: string;
  sortDirection?: string;
} 