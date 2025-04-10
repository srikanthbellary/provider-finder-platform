// ProviderResponse.java
package com.healthapp.mapservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResponse {
    private Long id;
    private String name;
    private String providerType;
    private String about;
    private String phone;
    private String email;
    private Boolean isVerified;
    private Boolean isRegisteredUser;
    private Integer experienceYears;
    private List<LocationResponse> locations;
    private List<String> specialties;
    private List<String> languages;
    
    // Used when a user location is provided for search
    private Double distanceInKm;
}

// LocationResponse.java
package com.healthapp.mapservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {
    private Long id;
    private String name;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private Boolean isPrimary;
    private String phone;
    private String email;
    private String website;
}

// ProviderSearchResponse.java
package com.healthapp.mapservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderSearchResponse {
    private List<ProviderResponse> providers;
    private Long totalCount;
    private Integer page;
    private Integer pageSize;
    private Integer totalPages;
    
    // ViewportMetadata
    private ViewportMetadata viewportMetadata;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ViewportMetadata {
        private Double northLat;
        private Double southLat;
        private Double eastLng;
        private Double westLng;
        private Integer providersInViewport;
        private Integer filteredCount;
    }
}