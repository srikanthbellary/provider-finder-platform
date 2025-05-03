package com.provider.chat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SymptomMappingService {
    private List<Map<String, String>> symptomMappings;
    private final ObjectMapper objectMapper;
    private Map<String, Set<String>> keywordToSpecialistMap;

    public SymptomMappingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() throws IOException {
        var resource = new ClassPathResource("symp_spec.json");
        symptomMappings = objectMapper.readValue(
            resource.getInputStream(),
            new TypeReference<List<Map<String, String>>>() {}
        );
        
        // Build keyword to specialist mapping for more efficient lookups
        buildKeywordMap();
    }
    
    private void buildKeywordMap() {
        keywordToSpecialistMap = new HashMap<>();
        
        for (Map<String, String> mapping : symptomMappings) {
            String symptoms = mapping.get("symptoms").toLowerCase();
            String specialist = mapping.get("specialist");
            
            // Extract significant words (longer than 4 characters)
            Arrays.stream(symptoms.split("\\s+|,"))
                .filter(word -> word.length() > 4)
                .forEach(keyword -> {
                    keywordToSpecialistMap
                        .computeIfAbsent(keyword, k -> new HashSet<>())
                        .add(specialist);
                });
            
            // Also add medical terms regardless of length
            Arrays.stream(symptoms.split("\\s+|,"))
                .filter(word -> isMedicalTerm(word))
                .forEach(keyword -> {
                    keywordToSpecialistMap
                        .computeIfAbsent(keyword, k -> new HashSet<>())
                        .add(specialist);
                });
        }
    }
    
    private boolean isMedicalTerm(String word) {
        // List of important medical terms that might be short but significant
        Set<String> medicalTerms = Set.of("pain", "ache", "rash", "sore", "lump", "cyst", 
                                         "blur", "numb", "sick", "weak", "swell");
        return medicalTerms.contains(word.toLowerCase());
    }

    public Optional<String> findSpecialist(String userMessage) {
        if (!StringUtils.hasText(userMessage)) {
            return Optional.empty();
        }

        String normalizedMessage = userMessage.toLowerCase();
        
        // Find all potential specialists based on keywords
        Map<String, Integer> specialistScores = new HashMap<>();
        
        // Score each word in the user message
        Arrays.stream(normalizedMessage.split("\\s+"))
            .filter(word -> word.length() > 3 || isMedicalTerm(word))
            .forEach(word -> {
                Set<String> specialists = keywordToSpecialistMap.getOrDefault(word, Collections.emptySet());
                specialists.forEach(specialist -> 
                    specialistScores.merge(specialist, 1, Integer::sum));
            });
            
        // Find specialist with highest score
        return specialistScores.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey);
    }
    
    public List<String> findTopSpecialists(String userMessage, int limit) {
        if (!StringUtils.hasText(userMessage)) {
            return Collections.emptyList();
        }

        String normalizedMessage = userMessage.toLowerCase();
        Map<String, Integer> specialistScores = new HashMap<>();
        
        // Score each word in the user message
        Arrays.stream(normalizedMessage.split("\\s+"))
            .filter(word -> word.length() > 3 || isMedicalTerm(word))
            .forEach(word -> {
                Set<String> specialists = keywordToSpecialistMap.getOrDefault(word, Collections.emptySet());
                specialists.forEach(specialist -> 
                    specialistScores.merge(specialist, 1, Integer::sum));
            });
            
        // Return top N specialists
        return specialistScores.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(limit)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
} 