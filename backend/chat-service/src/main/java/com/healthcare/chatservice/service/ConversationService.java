package com.healthcare.chatservice.service;

import com.healthcare.chatservice.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {
    private final AIService aiService;
    private final SemanticSearchService semanticSearchService;
    
    private static final int MAX_HISTORY_SIZE = 10;
    private static final int MAX_CONTEXT_WINDOW = 1800; // 30 minutes in seconds
    
    private final Map<String, List<ChatMessage>> conversationHistory = new ConcurrentHashMap<>();
    private final Map<String, String> currentSpecialist = new ConcurrentHashMap<>();
    private final Map<String, List<String>> userSymptoms = new ConcurrentHashMap<>();

    public void addToHistory(String sessionId, ChatMessage message) {
        conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>())
            .add(message);
        truncateHistory(sessionId);
        
        // Extract and store symptoms if present
        if (message.getType() == ChatMessage.MessageType.SYMPTOM_QUERY) {
            userSymptoms.computeIfAbsent(sessionId, k -> new ArrayList<>())
                .add(message.getContent());
        }
    }

    public String processMessage(String sessionId, ChatMessage message) {
        addToHistory(sessionId, message);

        switch (message.getType()) {
            case SYMPTOM_QUERY:
                return handleSymptomQuery(sessionId, message.getContent());
            case HOSPITAL_QUERY:
                return handleHospitalQuery(sessionId);
            case CHAT:
                return handleGeneralChat(sessionId, message.getContent());
            default:
                return "I'm not sure how to help with that. Could you rephrase your question?";
        }
    }

    private String handleSymptomQuery(String sessionId, String symptoms) {
        // Find specialist using semantic search
        String specialist = semanticSearchService.findBestSpecialist(symptoms);
        currentSpecialist.put(sessionId, specialist);

        // Get similar symptoms for context
        List<String> similarSymptoms = semanticSearchService.findSimilarSymptoms(symptoms);

        // Generate response using AI
        String context = buildSymptomContext(sessionId, symptoms, similarSymptoms);
        String guidance = aiService.generateHealthGuidance(context);

        return String.format("""
            Based on your symptoms, I recommend consulting a %s.
            
            %s
            
            Would you like me to find nearby specialists?""",
            specialist, guidance);
    }

    private String handleHospitalQuery(String sessionId) {
        String specialist = currentSpecialist.getOrDefault(sessionId, "General Physician");
        return String.format("I'll help you find nearby %s specialists. " +
            "Please share your location or preferred area.", specialist);
    }

    private String handleGeneralChat(String sessionId, String message) {
        String context = buildConversationContext(sessionId);
        return aiService.generateResponse(context + "\nUser: " + message);
    }

    private String buildSymptomContext(String sessionId, String currentSymptoms, 
                                     List<String> similarSymptoms) {
        StringBuilder context = new StringBuilder();
        context.append("Current symptoms: ").append(currentSymptoms).append("\n");
        
        // Add previous symptoms if any
        List<String> previousSymptoms = userSymptoms.getOrDefault(sessionId, Collections.emptyList());
        if (!previousSymptoms.isEmpty()) {
            context.append("Previous symptoms: ")
                .append(String.join(", ", previousSymptoms))
                .append("\n");
        }
        
        // Add similar symptoms for context
        if (!similarSymptoms.isEmpty()) {
            context.append("Similar reported symptoms: ")
                .append(String.join(", ", similarSymptoms))
                .append("\n");
        }
        
        return context.toString();
    }

    private String buildConversationContext(String sessionId) {
        List<ChatMessage> history = conversationHistory.getOrDefault(sessionId, Collections.emptyList());
        StringBuilder context = new StringBuilder("Previous conversation:\n");
        
        for (ChatMessage msg : history) {
            String role = msg.getUserId().equals("system") ? "Assistant" : "User";
            context.append(role).append(": ").append(msg.getContent()).append("\n");
        }
        
        return context.toString();
    }

    private void truncateHistory(String sessionId) {
        List<ChatMessage> history = conversationHistory.get(sessionId);
        if (history == null) return;

        // Remove old messages beyond MAX_HISTORY_SIZE
        if (history.size() > MAX_HISTORY_SIZE) {
            history = history.subList(history.size() - MAX_HISTORY_SIZE, history.size());
        }

        // Remove messages older than context window
        Instant cutoff = Instant.now().minusSeconds(MAX_CONTEXT_WINDOW);
        history.removeIf(msg -> msg.getTimestamp().isBefore(cutoff));

        conversationHistory.put(sessionId, history);
    }

    public void clearContext(String sessionId) {
        conversationHistory.remove(sessionId);
        currentSpecialist.remove(sessionId);
        userSymptoms.remove(sessionId);
    }
} 