package com.healthcare.searchservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.nd4j.linalg.ops.transforms.Transforms;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntelligentSymptomMapper {
    private final ObjectMapper objectMapper;
    private List<Map<String, Object>> symptomMappings;
    private INDArray symptomEmbeddings;
    private Map<Integer, List<String>> indexToSpecialists = new HashMap<>();
    private Map<String, List<String>> textMatchCache = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            loadSymptomMappings();
            createEmbeddings();
            log.info("Intelligent symptom mapper initialized with {} mappings", symptomMappings.size());
        } catch (Exception e) {
            log.error("Error initializing intelligent symptom mapper: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize symptom mapper", e);
        }
    }

    private void loadSymptomMappings() throws IOException {
        ClassPathResource resource = new ClassPathResource("symp_spec.json");
        symptomMappings = objectMapper.readValue(
            resource.getInputStream(),
            new TypeReference<List<Map<String, Object>>>() {}
        );

        // Create index to specialists mapping
        for (int i = 0; i < symptomMappings.size(); i++) {
            @SuppressWarnings("unchecked")
            List<String> specialists = (List<String>) symptomMappings.get(i).get("specialists");
            indexToSpecialists.put(i, specialists);
        }
    }

    private void createEmbeddings() {
        // Create embeddings matrix
        float[][] embeddings = new float[symptomMappings.size()][];
        for (int i = 0; i < symptomMappings.size(); i++) {
            String symptoms = (String) symptomMappings.get(i).get("symptoms");
            embeddings[i] = generateEmbedding(symptoms);
        }
        symptomEmbeddings = Nd4j.create(embeddings);
    }

    private float[] generateEmbedding(String text) {
        // Generate deterministic embeddings based on text features
        String[] words = text.toLowerCase().split("\\W+");
        float[] embedding = new float[100]; // 100-dimensional embedding
        Random random = new Random(text.hashCode()); // Deterministic for same input
        
        // Add some basic NLP-inspired features
        for (String word : words) {
            int hash = word.hashCode();
            for (int i = 0; i < embedding.length; i++) {
                embedding[i] += (float) Math.sin(hash * (i + 1));
            }
        }
        
        // Normalize the embedding
        float magnitude = 0;
        for (float v : embedding) {
            magnitude += v * v;
        }
        magnitude = (float) Math.sqrt(magnitude);
        for (int i = 0; i < embedding.length; i++) {
            embedding[i] /= magnitude;
        }
        
        return embedding;
    }

    public Optional<List<String>> findSpecialistsForSymptom(String symptom) {
        if (symptom == null || symptom.trim().isEmpty()) {
            return Optional.empty();
        }

        // Check cache first
        String normalizedSymptom = symptom.toLowerCase().trim();
        if (textMatchCache.containsKey(normalizedSymptom)) {
            return Optional.of(textMatchCache.get(normalizedSymptom));
        }

        try {
            float[] queryEmbedding = generateEmbedding(normalizedSymptom);
            INDArray queryVector = Nd4j.create(queryEmbedding);
            
            // Calculate cosine similarities
            INDArray similarities = Transforms.cosineSim(queryVector, symptomEmbeddings);
            
            // Find best matches
            List<Integer> topMatches = getTopK(similarities, 2);
            double bestMatchScore = similarities.getDouble(topMatches.get(0));
            
            if (bestMatchScore >= 0.5) {
                List<String> specialists = indexToSpecialists.get(topMatches.get(0));
                textMatchCache.put(normalizedSymptom, specialists);
                return Optional.of(specialists);
            }
            
            // Fallback to text-based matching for low confidence
            return findSpecialistsByPartialMatch(normalizedSymptom);
        } catch (Exception e) {
            log.error("Error in semantic search: {}", e.getMessage());
            // Fallback to text-based matching
            return findSpecialistsByPartialMatch(normalizedSymptom);
        }
    }

    private Optional<List<String>> findSpecialistsByPartialMatch(String normalizedSymptom) {
        // First try exact match
        for (Map<String, Object> mapping : symptomMappings) {
            String symptoms = ((String) mapping.get("symptoms")).toLowerCase();
            if (symptoms.equals(normalizedSymptom)) {
                @SuppressWarnings("unchecked")
                List<String> specialists = (List<String>) mapping.get("specialists");
                textMatchCache.put(normalizedSymptom, specialists);
                return Optional.of(specialists);
            }
        }

        // Then try partial match
        for (Map<String, Object> mapping : symptomMappings) {
            String symptoms = ((String) mapping.get("symptoms")).toLowerCase();
            if (symptoms.contains(normalizedSymptom) || normalizedSymptom.contains(symptoms)) {
                @SuppressWarnings("unchecked")
                List<String> specialists = (List<String>) mapping.get("specialists");
                textMatchCache.put(normalizedSymptom, specialists);
                return Optional.of(specialists);
            }
        }

        return Optional.empty();
    }

    private List<Integer> getTopK(INDArray similarities, int k) {
        PriorityQueue<Map.Entry<Integer, Double>> queue = new PriorityQueue<>(
            (a, b) -> Double.compare(b.getValue(), a.getValue())
        );

        for (int i = 0; i < similarities.length(); i++) {
            queue.offer(new AbstractMap.SimpleEntry<>(i, similarities.getDouble(i)));
        }

        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < k && !queue.isEmpty(); i++) {
            result.add(queue.poll().getKey());
        }
        return result;
    }
} 