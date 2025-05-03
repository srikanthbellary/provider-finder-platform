import axios from 'axios';
import { SearchRequest, SearchResponse } from '../types';

const API_URL = 'http://localhost:8080/api/search';

class SearchApi {
  async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await axios.post<SearchResponse>(API_URL, request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to search providers');
      }
      throw error;
    }
  }
}

export const searchApi = new SearchApi(); 