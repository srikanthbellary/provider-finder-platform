package com.healthcare.searchservice.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class SearchRequest {
    @NotNull
    private String query;
    
    @NotNull
    private String searchType; // SYMPTOM or SPECIALTY
    
    private ViewPreference viewPreference = ViewPreference.LIST; // Default to list view
    
    private Double userLat;
    private Double userLng;
    private Double radius = 10.0; // Default 10km radius
    private int page = 0;
    private int size = 20;
} 