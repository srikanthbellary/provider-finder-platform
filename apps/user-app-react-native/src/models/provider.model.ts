/**
 * Provider-related interfaces matching backend DTOs
 */

// Location information
export interface Location {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  latitude: number;
  longitude: number;
  isPrimary?: boolean;
  phone?: string;
  email?: string;
  website?: string;
}

// Provider information
export interface Provider {
  id: number;
  name: string;
  providerType?: string;
  about?: string;
  phone?: string;
  email?: string;
  isVerified?: boolean;
  isRegisteredUser?: boolean;
  experienceYears?: number;
  locations: Location[];
  specialties: string[];
  languages: string[];
  distanceInKm?: number;
}

// Provider search response from the backend
export interface ProviderSearchResponse {
  providers: Provider[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  viewportMetadata: ViewportMetadata;
}

// Viewport metadata from the backend
export interface ViewportMetadata {
  northLat: number;
  southLat: number;
  eastLng: number;
  westLng: number;
  providersInViewport: number;
  filteredCount: number;
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
  sortDirection?: 'asc' | 'desc';
} 