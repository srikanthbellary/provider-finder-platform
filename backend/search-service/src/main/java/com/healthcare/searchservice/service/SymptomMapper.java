package com.healthcare.searchservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class SymptomMapper {
    private Map<String, List<String>> symptomToSpecialistMap;
    private final ObjectMapper objectMapper;

    public SymptomMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.symptomToSpecialistMap = new HashMap<>();
    }

    @PostConstruct
    public void init() {
        try {
            var resource = new ClassPathResource("symp_spec.json");
            symptomToSpecialistMap = objectMapper.readValue(resource.getInputStream(),
                    objectMapper.getTypeFactory().constructMapType(HashMap.class, String.class, List.class));
            log.info("Successfully loaded symptom-to-specialist mapping with {} entries", symptomToSpecialistMap.size());
        } catch (IOException e) {
            log.error("Failed to load symptom-to-specialist mapping", e);
            throw new RuntimeException("Failed to initialize symptom mapper", e);
        }
    }

    public Optional<List<String>> findSpecialistsForSymptom(String symptom) {
        // Convert to lowercase for case-insensitive matching
        String normalizedSymptom = symptom.toLowerCase().trim();
        
        // First try exact match
        if (symptomToSpecialistMap.containsKey(normalizedSymptom)) {
            return Optional.of(symptomToSpecialistMap.get(normalizedSymptom));
        }

        // Then try partial match
        for (Map.Entry<String, List<String>> entry : symptomToSpecialistMap.entrySet()) {
            if (entry.getKey().toLowerCase().contains(normalizedSymptom) || 
                normalizedSymptom.contains(entry.getKey().toLowerCase())) {
                return Optional.of(entry.getValue());
            }
        }

        return Optional.empty();
    }
} 