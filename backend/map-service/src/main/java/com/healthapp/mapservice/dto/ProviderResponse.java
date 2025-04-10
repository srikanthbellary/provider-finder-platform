package com.healthapp.mapservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    
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