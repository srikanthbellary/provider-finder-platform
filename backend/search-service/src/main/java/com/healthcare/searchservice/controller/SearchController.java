package com.healthcare.searchservice.controller;

import com.healthcare.searchservice.dto.SearchRequest;
import com.healthcare.searchservice.dto.SearchResponse;
import com.healthcare.searchservice.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/providers")
@RequiredArgsConstructor
@Slf4j
public class SearchController {
    private final SearchService searchService;

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(@Valid @RequestBody SearchRequest request) {
        log.info("Received search request: {}", request);
        try {
            SearchResponse response = searchService.search(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid search request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error processing search request", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Search Service is healthy");
    }
} 