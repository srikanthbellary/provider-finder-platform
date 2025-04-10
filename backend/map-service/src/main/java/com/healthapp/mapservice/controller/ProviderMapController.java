package com.healthapp.mapservice.controller;

import com.healthapp.mapservice.dto.ProviderSearchRequest;
import com.healthapp.mapservice.dto.ProviderSearchResponse;
import com.healthapp.mapservice.service.ProviderMapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.util.List;

@RestController
@RequestMapping("/providers")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Provider Map API", description = "APIs for discovering healthcare providers on a map")
public class ProviderMapController {

    private final ProviderMapService providerMapService;

    @Operation(
        summary = "Search for providers within viewport",
        description = "Retrieves providers within the specified map viewport with optional filtering",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(schema = @Schema(implementation = ProviderSearchResponse.class))
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters"
            )
        }
    )
    @PostMapping("/search")
    public ResponseEntity<ProviderSearchResponse> searchProviders(
            @Valid @RequestBody ProviderSearchRequest request) {
        
        log.debug("Searching for providers with request: {}", request);
        ProviderSearchResponse response = providerMapService.searchProviders(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Simple provider search by viewport",
        description = "Simpler GET endpoint for searching providers by map viewport coordinates",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful operation",
                content = @Content(schema = @Schema(implementation = ProviderSearchResponse.class))
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters"
            )
        }
    )
    @GetMapping("/map")
    public ResponseEntity<ProviderSearchResponse> getProvidersInViewport(
            @Parameter(description = "North latitude bound", required = true)
            @RequestParam @Min(-90) @Max(90) Double northLat,
            
            @Parameter(description = "South latitude bound", required = true)
            @RequestParam @Min(-90) @Max(90) Double southLat,
            
            @Parameter(description = "East longitude bound", required = true)
            @RequestParam @Min(-180) @Max(180) Double eastLng,
            
            @Parameter(description = "West longitude bound", required = true)
            @RequestParam @Min(-180) @Max(180) Double westLng,
            
            @Parameter(description = "Search term (optional)")
            @RequestParam(required = false) String searchTerm,
            
            @Parameter(description = "Filter by specialty IDs (optional)")
            @RequestParam(required = false) List<Integer> specialtyIds,
            
            @Parameter(description = "Filter by provider type IDs (optional)")
            @RequestParam(required = false) List<Integer> providerTypeIds,
            
            @Parameter(description = "Filter by language IDs (optional)")
            @RequestParam(required = false) List<Integer> languageIds,
            
            @Parameter(description = "Filter for verified providers only")
            @RequestParam(defaultValue = "false") Boolean verifiedOnly,
            
            @Parameter(description = "Filter for registered providers only")
            @RequestParam(defaultValue = "false") Boolean registeredOnly,
            
            @Parameter(description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") @Min(1) Integer page,
            
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) Integer pageSize,
            
            @Parameter(description = "User latitude for distance calculations (optional)")
            @RequestParam(required = false) Double userLat,
            
            @Parameter(description = "User longitude for distance calculations (optional)")
            @RequestParam(required = false) Double userLng,
            
            @Parameter(description = "Sort by field (distance, name)")
            @RequestParam(defaultValue = "distance") String sortBy,
            
            @Parameter(description = "Sort direction (asc, desc)")
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        // Build search request from parameters
        ProviderSearchRequest request = ProviderSearchRequest.builder()
                .northLat(northLat)
                .southLat(southLat)
                .eastLng(eastLng)
                .westLng(westLng)
                .searchTerm(searchTerm)
                .specialtyIds(specialtyIds)
                .providerTypeIds(providerTypeIds)
                .languageIds(languageIds)
                .isVerifiedOnly(verifiedOnly)
                .isRegisteredOnly(registeredOnly)
                .page(page)
                .pageSize(pageSize)
                .userLat(userLat)
                .userLng(userLng)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
        
        log.debug("GET request for providers in viewport: {}", request);
        ProviderSearchResponse response = providerMapService.searchProviders(request);
        return ResponseEntity.ok(response);
    }
}