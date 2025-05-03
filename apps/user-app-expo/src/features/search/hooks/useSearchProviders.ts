import { useState } from 'react';
import { Provider, SearchRequest, SearchResponse, MapViewData } from '../types';
import { searchApi } from '../api/searchApi';

export const useSearchProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [mapViewData, setMapViewData] = useState<MapViewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappedSpecialty, setMappedSpecialty] = useState<string | null>(null);
  const [alternativeSpecialties, setAlternativeSpecialties] = useState<string[]>([]);

  const search = async (request: SearchRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchApi.search(request);
      setProviders(response.providers);
      setMappedSpecialty(response.mappedSpecialty || null);
      setAlternativeSpecialties(response.alternativeSpecialties || []);
      if (response.mapViewData) {
        setMapViewData(response.mapViewData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setProviders([]);
      setMapViewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    providers,
    mapViewData,
    isLoading,
    error,
    search,
    mappedSpecialty,
    alternativeSpecialties,
  };
}; 