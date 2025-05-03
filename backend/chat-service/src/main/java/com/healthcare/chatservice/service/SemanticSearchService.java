package com.healthcare.chatservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SemanticSearchService {
    private final ObjectMapper objectMapper;
    private final AIService aiService;

    private List<Map<String, Object>> symptomMappings;
    private Map<Integer, String> indexToSpecialist = new HashMap<>();
    private Map<String, Set<String>> symptomKeywords = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            loadSymptomMappings();
            extractKeywords();
            log.info("Semantic search service initialized with {} mappings", symptomMappings.size());
        } catch (Exception e) {
            log.error("Error initializing semantic search: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize semantic search", e);
        }
    }

    private void loadSymptomMappings() throws IOException {
        ClassPathResource resource = new ClassPathResource("symp_spec.json");
        symptomMappings = objectMapper.readValue(
            resource.getInputStream(),
            new TypeReference<List<Map<String, Object>>>() {}
        );

        // Create index to specialist mapping
        for (int i = 0; i < symptomMappings.size(); i++) {
            indexToSpecialist.put(i, (String) symptomMappings.get(i).get("specialist"));
        }
    }

    private void extractKeywords() {
        for (int i = 0; i < symptomMappings.size(); i++) {
            String symptoms = (String) symptomMappings.get(i).get("symptoms");
            String specialist = (String) symptomMappings.get(i).get("specialist");
            
            // Extract significant words (more than 3 chars)
            String[] words = symptoms.toLowerCase().split("\\W+");
            for (String word : words) {
                if (word.length() > 3) {
                    symptomKeywords.computeIfAbsent(word, k -> new HashSet<>()).add(specialist);
                }
            }
        }
    }

    public String findBestSpecialist(String symptoms) {
        try {
            // Simple keyword matching approach
            Map<String, Integer> specialistScores = new HashMap<>();
            
            String[] words = symptoms.toLowerCase().split("\\W+");
            for (String word : words) {
                if (word.length() > 3) {
                    Set<String> specialists = symptomKeywords.getOrDefault(word, Collections.emptySet());
                    for (String specialist : specialists) {
                        specialistScores.merge(specialist, 1, Integer::sum);
                    }
                }
            }
            
            // Find the specialist with the highest score
            return specialistScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElseGet(() -> aiService.generateSpecialistRecommendation(symptoms));
            
        } catch (Exception e) {
            log.error("Error in semantic search: {}", e.getMessage());
            return "General Physician";
        }
    }

    public List<String> findSimilarSymptoms(String symptoms) {
        try {
            List<SimilarityScore> scores = new ArrayList<>();
            String lowerCaseSymptoms = symptoms.toLowerCase();
            
            // Calculate simple similarity scores based on word overlap
            for (int i = 0; i < symptomMappings.size(); i++) {
                String mappedSymptoms = (String) symptomMappings.get(i).get("symptoms");
                double score = calculateSimilarity(lowerCaseSymptoms, mappedSymptoms.toLowerCase());
                scores.add(new SimilarityScore(i, score));
            }
            
            // Sort by similarity score
            scores.sort((a, b) -> Double.compare(b.score, a.score));
            
            // Get top 5 similar symptoms
            return scores.stream()
                .limit(5)
                .map(score -> (String) symptomMappings.get(score.index).get("symptoms"))
                .toList();
        } catch (Exception e) {
            log.error("Error finding similar symptoms: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    
    private double calculateSimilarity(String text1, String text2) {
        // Simple Jaccard similarity calculation
        Set<String> words1 = new HashSet<>(Arrays.asList(text1.split("\\W+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(text2.split("\\W+")));
        
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        
        return (double) intersection.size() / union.size();
    }
    
    private static class SimilarityScore {
        private final int index;
        private final double score;
        
        public SimilarityScore(int index, double score) {
            this.index = index;
            this.score = score;
        }
    }
} 