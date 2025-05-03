export type ViewPreference = 'MAP' | 'LIST';

export interface Provider {
  id: number;
  name: string;
  specialty: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating: number;
  phoneNumber: string;
  email: string;
  acceptingNewPatients: boolean;
}

export interface MapViewData {
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
  bounds: {
    northEastLat: number;
    northEastLng: number;
    southWestLat: number;
    southWestLng: number;
  };
}

export interface SearchRequest {
  query: string;
  searchType: 'SYMPTOM' | 'SPECIALTY';
  viewPreference: ViewPreference;
  userLat?: number;
  userLng?: number;
  radius?: number;
  page?: number;
  size?: number;
}

export interface SearchResponse {
  providers: Provider[];
  mappedSpecialty?: string;
  alternativeSpecialties?: string[];
  viewPreference: ViewPreference;
  mapViewData?: MapViewData;
  totalResults: number;
  page: number;
  size: number;
  searchRadiusKm: number;
} 