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
public class ProviderSearchResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    
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
    public static class ViewportMetadata implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private Double northLat;
        private Double southLat;
        private Double eastLng;
        private Double westLng;
        private Integer providersInViewport;
        private Integer filteredCount;
    }
}