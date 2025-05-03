package com.healthcare.chatservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class SymptomMappingService {
    private final ObjectMapper objectMapper;
    private List<Map<String, Object>> symptomMappings;

    public SymptomMappingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("symp_spec.json");
            symptomMappings = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Map<String, Object>>>() {}
            );
            log.info("Loaded {} symptom mappings", symptomMappings.size());
        } catch (IOException e) {
            log.error("Error loading symptom mappings: {}", e.getMessage(), e);
            symptomMappings = List.of();
        }
    }

    public String mapSymptomToSpecialist(String symptoms) {
        String normalizedSymptoms = symptoms.toLowerCase();
        
        Optional<Map<String, Object>> bestMatch = symptomMappings.stream()
            .filter(mapping -> {
                String mappedSymptoms = ((String) mapping.get("symptoms")).toLowerCase();
                return containsAnyKeyword(normalizedSymptoms, mappedSymptoms);
            })
            .findFirst();

        return bestMatch
            .map(mapping -> (String) mapping.get("specialist"))
            .orElse("General Physician");
    }

    private boolean containsAnyKeyword(String input, String keywords) {
        String[] keywordArray = keywords.split(",");
        return java.util.Arrays.stream(keywordArray)
            .map(String::trim)
            .anyMatch(input::contains);
    }
} 