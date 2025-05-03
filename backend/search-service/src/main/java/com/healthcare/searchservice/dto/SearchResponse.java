package com.healthcare.searchservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class SearchResponse {
    private List<ProviderDTO> providers;
    private String mappedSpecialty; // If search was by symptom, this will contain the mapped specialty
    private List<String> alternativeSpecialties;
    private ViewPreference viewPreference;
    private MapViewData mapViewData;
    private long totalResults;
    private int page;
    private int size;
    private double searchRadiusKm;
    private int currentPage;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}

@Data
class MapViewData {
    private double centerLat; // Center latitude for map view
    private double centerLng; // Center longitude for map view
    private double zoomLevel; // Suggested zoom level based on results
    private BoundingBox bounds; // Bounding box for all results
}

@Data
class BoundingBox {
    private double northEastLat;
    private double northEastLng;
    private double southWestLat;
    private double southWestLng;
}

@Data
class ProviderDTO {
    private Long id;
    private String name;
    private String specialty;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double distance; // Distance from user if location provided
    private Double rating;
    private String phoneNumber;
    private String email;
    private boolean acceptingNewPatients;
} 