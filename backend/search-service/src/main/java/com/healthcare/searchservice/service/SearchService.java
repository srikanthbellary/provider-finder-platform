package com.healthcare.searchservice.service;

import com.healthcare.searchservice.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SearchService {
    private final IntelligentSymptomMapper symptomMapper;
    private final RestTemplate restTemplate;
    private static final String MAP_SERVICE_URL = "http://map-service/api/map/providers";

    public SearchResponse search(SearchRequest request) {
        log.debug("Processing search request: {}", request);
        
        if ("SYMPTOM".equals(request.getSearchType())) {
            return handleSymptomSearch(request);
        } else {
            return handleDirectSearch(request);
        }
    }

    private SearchResponse handleSymptomSearch(SearchRequest request) {
        // Map symptom to specialists using intelligent mapper
        List<String> specialists = symptomMapper.findSpecialistsForSymptom(request.getQuery())
                .orElseThrow(() -> new IllegalArgumentException("No specialists found for symptom: " + request.getQuery()));

        // Create a new search request with the first specialist type
        SearchRequest specialistRequest = new SearchRequest();
        specialistRequest.setQuery(specialists.get(0));
        specialistRequest.setSearchType("SPECIALTY");
        specialistRequest.setUserLat(request.getUserLat());
        specialistRequest.setUserLng(request.getUserLng());
        specialistRequest.setRadius(request.getRadius());
        specialistRequest.setPage(request.getPage());
        specialistRequest.setSize(request.getSize());
        specialistRequest.setViewPreference(request.getViewPreference());

        // Search for providers with this specialty
        SearchResponse response = handleDirectSearch(specialistRequest);
        response.setMappedSpecialty(specialists.get(0));
        response.setViewPreference(request.getViewPreference());
        
        // Add alternative specialists if available
        if (specialists.size() > 1) {
            response.setAlternativeSpecialties(specialists.subList(1, specialists.size()));
        }

        // If map view is requested, calculate map data
        if (ViewPreference.MAP.equals(request.getViewPreference())) {
            response.setMapViewData(calculateMapViewData(response.getProviders(), request));
        }
        
        return response;
    }

    private SearchResponse handleDirectSearch(SearchRequest request) {
        // Forward the search to the map service
        try {
            SearchResponse response = restTemplate.postForObject(MAP_SERVICE_URL, request, SearchResponse.class);
            
            // Set view preference
            response.setViewPreference(request.getViewPreference());
            
            // Calculate map data if needed
            if (ViewPreference.MAP.equals(request.getViewPreference())) {
                response.setMapViewData(calculateMapViewData(response.getProviders(), request));
            }
            
            return response;
        } catch (Exception e) {
            log.error("Error searching providers", e);
            throw new RuntimeException("Failed to search providers", e);
        }
    }

    private MapViewData calculateMapViewData(List<ProviderDTO> providers, SearchRequest request) {
        MapViewData mapData = new MapViewData();
        
        if (providers == null || providers.isEmpty()) {
            // Default to user location or center of the city
            mapData.setCenterLat(request.getUserLat() != null ? request.getUserLat() : 0.0);
            mapData.setCenterLng(request.getUserLng() != null ? request.getUserLng() : 0.0);
            mapData.setZoomLevel(12.0); // Default city-level zoom
            return mapData;
        }

        // Calculate bounding box
        double minLat = Double.MAX_VALUE;
        double maxLat = -Double.MAX_VALUE;
        double minLng = Double.MAX_VALUE;
        double maxLng = -Double.MAX_VALUE;

        for (ProviderDTO provider : providers) {
            if (provider.getLatitude() != null && provider.getLongitude() != null) {
                minLat = Math.min(minLat, provider.getLatitude());
                maxLat = Math.max(maxLat, provider.getLatitude());
                minLng = Math.min(minLng, provider.getLongitude());
                maxLng = Math.max(maxLng, provider.getLongitude());
            }
        }

        // Create bounding box
        BoundingBox bounds = new BoundingBox();
        bounds.setNorthEastLat(maxLat);
        bounds.setNorthEastLng(maxLng);
        bounds.setSouthWestLat(minLat);
        bounds.setSouthWestLng(minLng);
        mapData.setBounds(bounds);

        // Calculate center
        mapData.setCenterLat((maxLat + minLat) / 2);
        mapData.setCenterLng((maxLng + minLng) / 2);

        // Calculate zoom level based on bounding box size
        double latDiff = maxLat - minLat;
        double lngDiff = maxLng - minLng;
        double maxDiff = Math.max(latDiff, lngDiff);
        
        // Simple zoom level calculation (can be refined based on needs)
        double zoomLevel = Math.max(1, Math.min(20, Math.log(360 / maxDiff) / Math.log(2)));
        mapData.setZoomLevel(zoomLevel);

        return mapData;
    }
} 