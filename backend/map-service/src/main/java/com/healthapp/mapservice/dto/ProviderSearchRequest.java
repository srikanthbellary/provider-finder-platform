package com.healthapp.mapservice.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.List;

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
    
    private Boolean isVerifiedOnly = false;
    
    private Boolean isRegisteredOnly = false;
    
    @Min(value = 1, message = "Page number must be at least 1")
    private Integer page = 1;
    
    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size must not exceed 100")
    private Integer pageSize = 20;
    
    // Current user location (optional, for distance sorting)
    private Double userLat;
    private Double userLng;
    
    private String sortBy = "distance"; // distance, rating, name
    
    private String sortDirection = "asc"; // asc, desc

    // Explicit getters and setters
    public Double getNorthLat() {
        return northLat;
    }

    public void setNorthLat(Double northLat) {
        this.northLat = northLat;
    }

    public Double getSouthLat() {
        return southLat;
    }

    public void setSouthLat(Double southLat) {
        this.southLat = southLat;
    }

    public Double getEastLng() {
        return eastLng;
    }

    public void setEastLng(Double eastLng) {
        this.eastLng = eastLng;
    }

    public Double getWestLng() {
        return westLng;
    }

    public void setWestLng(Double westLng) {
        this.westLng = westLng;
    }

    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

    public List<Integer> getSpecialtyIds() {
        return specialtyIds;
    }

    public void setSpecialtyIds(List<Integer> specialtyIds) {
        this.specialtyIds = specialtyIds;
    }

    public List<Integer> getProviderTypeIds() {
        return providerTypeIds;
    }

    public void setProviderTypeIds(List<Integer> providerTypeIds) {
        this.providerTypeIds = providerTypeIds;
    }

    public List<Integer> getLanguageIds() {
        return languageIds;
    }

    public void setLanguageIds(List<Integer> languageIds) {
        this.languageIds = languageIds;
    }

    public Boolean getIsVerifiedOnly() {
        return isVerifiedOnly;
    }

    public void setIsVerifiedOnly(Boolean isVerifiedOnly) {
        this.isVerifiedOnly = isVerifiedOnly;
    }

    public Boolean getIsRegisteredOnly() {
        return isRegisteredOnly;
    }

    public void setIsRegisteredOnly(Boolean isRegisteredOnly) {
        this.isRegisteredOnly = isRegisteredOnly;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Double getUserLat() {
        return userLat;
    }

    public void setUserLat(Double userLat) {
        this.userLat = userLat;
    }

    public Double getUserLng() {
        return userLng;
    }

    public void setUserLng(Double userLng) {
        this.userLng = userLng;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    // Builder pattern implementation
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Double northLat;
        private Double southLat;
        private Double eastLng;
        private Double westLng;
        private String searchTerm;
        private List<Integer> specialtyIds;
        private List<Integer> providerTypeIds;
        private List<Integer> languageIds;
        private Boolean isVerifiedOnly = false;
        private Boolean isRegisteredOnly = false;
        private Integer page = 1;
        private Integer pageSize = 20;
        private Double userLat;
        private Double userLng;
        private String sortBy = "distance";
        private String sortDirection = "asc";

        public Builder northLat(Double northLat) {
            this.northLat = northLat;
            return this;
        }

        public Builder southLat(Double southLat) {
            this.southLat = southLat;
            return this;
        }

        public Builder eastLng(Double eastLng) {
            this.eastLng = eastLng;
            return this;
        }

        public Builder westLng(Double westLng) {
            this.westLng = westLng;
            return this;
        }

        public Builder searchTerm(String searchTerm) {
            this.searchTerm = searchTerm;
            return this;
        }

        public Builder specialtyIds(List<Integer> specialtyIds) {
            this.specialtyIds = specialtyIds;
            return this;
        }

        public Builder providerTypeIds(List<Integer> providerTypeIds) {
            this.providerTypeIds = providerTypeIds;
            return this;
        }

        public Builder languageIds(List<Integer> languageIds) {
            this.languageIds = languageIds;
            return this;
        }

        public Builder isVerifiedOnly(Boolean isVerifiedOnly) {
            this.isVerifiedOnly = isVerifiedOnly;
            return this;
        }

        public Builder isRegisteredOnly(Boolean isRegisteredOnly) {
            this.isRegisteredOnly = isRegisteredOnly;
            return this;
        }

        public Builder page(Integer page) {
            this.page = page;
            return this;
        }

        public Builder pageSize(Integer pageSize) {
            this.pageSize = pageSize;
            return this;
        }

        public Builder userLat(Double userLat) {
            this.userLat = userLat;
            return this;
        }

        public Builder userLng(Double userLng) {
            this.userLng = userLng;
            return this;
        }

        public Builder sortBy(String sortBy) {
            this.sortBy = sortBy;
            return this;
        }

        public Builder sortDirection(String sortDirection) {
            this.sortDirection = sortDirection;
            return this;
        }

        public ProviderSearchRequest build() {
            return new ProviderSearchRequest(
                    northLat, southLat, eastLng, westLng,
                    searchTerm, specialtyIds, providerTypeIds, languageIds,
                    isVerifiedOnly, isRegisteredOnly,
                    page, pageSize, userLat, userLng,
                    sortBy, sortDirection
            );
        }
    }
}