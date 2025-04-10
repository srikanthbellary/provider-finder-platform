package com.healthapp.mapservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderSearchRequest {

    // Viewport bounds (required for map-based search)
    @NotNull(message = "North latitude bound is required")
    @Min(value = -90, message = "North latitude must be between -90 and 90")
    @Max(value = 90, message = "North latitude must be between -90 and 90")
    private Double northLat;

    @NotNull(message = "South latitude bound is required")
    @Min(value = -90, message = "South latitude must be between -90 and 90")
    @Max(value = 90, message = "South latitude must be between -90 and 90")
    private Double southLat;

    @NotNull(message = "East longitude bound is required")
    @Min(value = -180, message = "East longitude must be between -180 and 180")
    @Max(value = 180, message = "East longitude must be between -180 and 180")
    private Double eastLng;

    @NotNull(message = "West longitude bound is required")
    @Min(value = -180, message = "West longitude must be between -180 and 180")
    @Max(value = 180, message = "West longitude must be between -180 and 180")
    private Double westLng;

    // Optional search parameters
    private String searchTerm;
    
    private List<Integer> specialtyIds;
    
    private List<Integer> providerTypeIds;
    
    private List<Integer> languageIds;
    
    @Builder.Default
    private Boolean isVerifiedOnly = false;
    
    @Builder.Default
    private Boolean isRegisteredOnly = false;
    
    @Min(value = 1, message = "Page number must be at least 1")
    @Builder.Default
    private Integer page = 1;
    
    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size must not exceed 100")
    @Builder.Default
    private Integer pageSize = 20;
    
    // Current user location (optional, for distance sorting)
    private Double userLat;
    private Double userLng;
    
    @Builder.Default
    private String sortBy = "distance"; // distance, rating, name
    
    @Builder.Default
    private String sortDirection = "asc"; // asc, desc
}