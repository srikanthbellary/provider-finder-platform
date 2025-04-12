package com.healthapp.mapservice.service;

import com.healthapp.mapservice.dto.LocationResponse;
import com.healthapp.mapservice.dto.ProviderResponse;
import com.healthapp.mapservice.dto.ProviderSearchRequest;
import com.healthapp.mapservice.dto.ProviderSearchResponse;
import com.healthapp.mapservice.model.Language;
import com.healthapp.mapservice.model.Provider;
import com.healthapp.mapservice.model.ProviderLocation;
import com.healthapp.mapservice.model.Specialty;
import com.healthapp.mapservice.repository.ProviderLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderMapService {

    private final ProviderLocationRepository providerLocationRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    
    @Value("${app.map.default-search-radius-km:5}")
    private double defaultSearchRadiusKm;
    
    @Value("${app.map.max-search-radius-km:50}")
    private double maxSearchRadiusKm;
    
    @Value("${app.map.max-results:100}")
    private int maxResults;

    /**
     * Search for providers within a given viewport with optional filtering
     */
    @Transactional(readOnly = true)
    public ProviderSearchResponse searchProviders(ProviderSearchRequest request) {
        // Create a polygon representing the viewport
        Polygon viewport = createViewportPolygon(
                request.getWestLng(), 
                request.getSouthLat(), 
                request.getEastLng(), 
                request.getNorthLat()
        );
        
        // Count total providers in viewport
        Long totalProvidersInViewport = providerLocationRepository.countProvidersInViewport(
                request.getWestLng(),
                request.getSouthLat(),
                request.getEastLng(),
                request.getNorthLat()
        );
        
        // Determine if we need distance-based sorting
        boolean useDistanceSorting = request.getUserLat() != null && request.getUserLng() != null && 
                "distance".equalsIgnoreCase(request.getSortBy());
        
        List<ProviderResponse> providerResponses;
        long totalCount;
        
        if (useDistanceSorting) {
            // Use native query with distance calculation
            providerResponses = searchProvidersWithDistance(request);
            
            // Count total filtered results
            totalCount = countFilteredProvidersInViewport(request, viewport);
        } else {
            // Use JPA query with standard sorting
            providerResponses = searchProvidersWithJpa(request, viewport);
            
            // Total count is retrieved from JPA pagination
            totalCount = providerResponses.size(); // This will be updated below
        }
        
        int totalPages = (int) Math.ceil((double) totalCount / request.getPageSize());
        
        // Build viewport metadata
        ProviderSearchResponse.ViewportMetadata viewportMetadata = ProviderSearchResponse.ViewportMetadata.builder()
                .northLat(request.getNorthLat())
                .southLat(request.getSouthLat())
                .eastLng(request.getEastLng())
                .westLng(request.getWestLng())
                .providersInViewport(totalProvidersInViewport.intValue())
                .filteredCount((int) totalCount)
                .build();
        
        // Build and return response
        return ProviderSearchResponse.builder()
                .providers(providerResponses)
                .totalCount(totalCount)
                .page(request.getPage())
                .pageSize(request.getPageSize())
                .totalPages(totalPages)
                .viewportMetadata(viewportMetadata)
                .build();
    }
    
    /**
     * Search for providers using standard JPA queries (no distance calculation)
     */
    private List<ProviderResponse> searchProvidersWithJpa(ProviderSearchRequest request, Polygon viewport) {
        // Determine sort direction
        Sort.Direction direction = "desc".equalsIgnoreCase(request.getSortDirection()) 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
        
        // Create pageable with sorting
        Pageable pageable = PageRequest.of(
                request.getPage() - 1, 
                request.getPageSize(),
                Sort.by(direction, getSortField(request.getSortBy()))
        );
        
        // Get specialty, provider type, and language IDs for filtering
        Integer specialtyId = request.getSpecialtyIds() != null && !request.getSpecialtyIds().isEmpty() 
                ? request.getSpecialtyIds().get(0) 
                : null;
        
        Integer providerTypeId = request.getProviderTypeIds() != null && !request.getProviderTypeIds().isEmpty() 
                ? request.getProviderTypeIds().get(0) 
                : null;
        
        Integer languageId = request.getLanguageIds() != null && !request.getLanguageIds().isEmpty() 
                ? request.getLanguageIds().get(0) 
                : null;
        
        // Execute query with filters
        Page<ProviderLocation> providerLocations = providerLocationRepository.findAllInViewportWithFilters(
                viewport,
                request.getSearchTerm(),
                specialtyId,
                providerTypeId,
                languageId,
                request.getIsVerifiedOnly(),
                request.getIsRegisteredOnly(),
                pageable
        );
        
        // Convert results to DTOs
        return providerLocations.getContent().stream()
                .map(this::convertToProviderResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Search for providers using native query with distance calculation
     */
    private List<ProviderResponse> searchProvidersWithDistance(ProviderSearchRequest request) {
        try {
            log.debug("Executing provider search with distance calculation");
            
            // Create viewport polygon
            Polygon viewport = createViewportPolygon(
                    request.getWestLng(), 
                    request.getSouthLat(), 
                    request.getEastLng(), 
                    request.getNorthLat()
            );
            
            // For now, use JPA query while we troubleshoot the native query
            log.debug("Using JPA query as alternative to native query with distance");
            return searchProvidersWithJpa(request, viewport);
            
        } catch (Exception e) {
            log.error("Error searching for providers with distance: {}", e.getMessage(), e);
            // Fallback to standard JPA query without distance sorting
            Polygon viewport = createViewportPolygon(
                    request.getWestLng(), 
                    request.getSouthLat(), 
                    request.getEastLng(), 
                    request.getNorthLat()
            );
            return searchProvidersWithJpa(request, viewport);
        }
    }
    
    /**
     * Count filtered providers in viewport
     */
    private long countFilteredProvidersInViewport(ProviderSearchRequest request, Polygon viewport) {
        // Get specialty, provider type, and language IDs for filtering
        Integer specialtyId = request.getSpecialtyIds() != null && !request.getSpecialtyIds().isEmpty() 
                ? request.getSpecialtyIds().get(0) 
                : null;
        
        Integer providerTypeId = request.getProviderTypeIds() != null && !request.getProviderTypeIds().isEmpty() 
                ? request.getProviderTypeIds().get(0) 
                : null;
        
        Integer languageId = request.getLanguageIds() != null && !request.getLanguageIds().isEmpty() 
                ? request.getLanguageIds().get(0) 
                : null;
        
        return providerLocationRepository.countInViewportWithFilters(
                viewport,
                request.getSearchTerm(),
                specialtyId,
                providerTypeId,
                languageId,
                request.getIsVerifiedOnly(),
                request.getIsRegisteredOnly()
        );
    }
    
    /**
     * Convert ProviderLocation entity to ProviderResponse DTO
     */
    private ProviderResponse convertToProviderResponse(ProviderLocation location) {
        Provider provider = location.getProvider();
        
        // Create location response
        LocationResponse locationResponse = LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .addressLine1(location.getAddressLine1())
                .addressLine2(location.getAddressLine2())
                .city(location.getCity())
                .state(location.getState())
                .postalCode(location.getPostalCode())
                .country(location.getCountry())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .isPrimary(location.getIsPrimary())
                .phone(location.getPhone())
                .email(location.getEmail())
                .website(location.getWebsite())
                .build();
        
        // Extract specialties
        List<String> specialties = provider.getSpecialties().stream()
                .map(Specialty::getName)
                .collect(Collectors.toList());
        
        // Extract languages
        List<String> languages = provider.getLanguages().stream()
                .map(Language::getName)
                .collect(Collectors.toList());
        
        // Build provider response
        return ProviderResponse.builder()
                .id(provider.getId())
                .name(provider.getName())
                .providerType(provider.getProviderType() != null ? provider.getProviderType().getName() : null)
                .about(provider.getAbout())
                .phone(provider.getPhone())
                .email(provider.getEmail())
                .isVerified(provider.getIsVerified())
                .isRegisteredUser(provider.getIsRegisteredUser())
                .experienceYears(provider.getExperienceYears())
                .locations(List.of(locationResponse))
                .specialties(specialties)
                .languages(languages)
                .build();
    }
    
    /**
     * Create a polygon representing the viewport
     */
    private Polygon createViewportPolygon(double westLng, double southLat, double eastLng, double northLat) {
        Coordinate[] coordinates = new Coordinate[5];
        coordinates[0] = new Coordinate(westLng, southLat);
        coordinates[1] = new Coordinate(eastLng, southLat);
        coordinates[2] = new Coordinate(eastLng, northLat);
        coordinates[3] = new Coordinate(westLng, northLat);
        coordinates[4] = new Coordinate(westLng, southLat); // Close the polygon
        
        return geometryFactory.createPolygon(coordinates);
    }
    
    /**
     * Get the appropriate sort field based on the sortBy parameter
     */
    private String getSortField(String sortBy) {
        switch (sortBy.toLowerCase()) {
            case "name":
                return "provider.name";
            case "rating":
                // If rating field is implemented later
                return "provider.name"; // Fallback to name
            default:
                return "id"; // Default sort by ID
        }
    }
}