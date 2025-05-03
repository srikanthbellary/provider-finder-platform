package com.healthcare.chatservice.service;

import com.healthcare.chatservice.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationService conversationService;
    private final AIService aiService;
    private final SemanticSearchService semanticSearchService;

    public void handleMessage(ChatMessage message) {
        message.setId(UUID.randomUUID().toString());
        message.setTimestamp(Instant.now());
        message.setStatus(ChatMessage.MessageStatus.DELIVERED);

        try {
            // Process message and get AI response
            String response = conversationService.processMessage(message.getSessionId(), message);
            
            // Send response back to user
            sendResponse(message.getSessionId(), response, determineResponseType(message.getType()));
            
            // If this was a symptom query, also suggest similar symptoms
            if (message.getType() == ChatMessage.MessageType.SYMPTOM_QUERY) {
                String similarSymptomsResponse = generateSimilarSymptomsResponse(message.getContent());
                if (similarSymptomsResponse != null) {
                    sendResponse(message.getSessionId(), similarSymptomsResponse, ChatMessage.MessageType.SYSTEM);
                }
            }
        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
            sendErrorMessage(message.getSessionId(), 
                "I apologize, but I encountered an error processing your message. Please try again.");
        }
    }
    
    public Map<String, Object> processRestMessage(String message) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if the message is asking about symptoms
            if (message.toLowerCase().contains("symptom") || 
                message.toLowerCase().contains("pain") || 
                message.toLowerCase().contains("feel")) {
                
                // Find specialist recommendation
                String specialist = semanticSearchService.findBestSpecialist(message);
                
                response.put("specialist", specialist);
                response.put("message", "Based on your symptoms, I recommend consulting a " + specialist + 
                    ". Would you like me to help you find one near you?");
                response.put("action", "FIND_PROVIDER");
                
                // Find similar symptoms
                List<String> similarSymptoms = semanticSearchService.findSimilarSymptoms(message);
                if (!similarSymptoms.isEmpty()) {
                    response.put("similarSymptoms", similarSymptoms);
                }
            } else {
                // Generic response
                String aiResponse = aiService.generateResponse(message);
                response.put("message", aiResponse);
                response.put("action", "CONTINUE_CHAT");
            }
            
            // Add timestamp
            response.put("timestamp", Instant.now().toString());
            response.put("id", UUID.randomUUID().toString());
            
        } catch (Exception e) {
            log.error("Error processing REST message: {}", e.getMessage(), e);
            response.put("error", "Error processing message");
            response.put("message", "I apologize, but I encountered an error processing your message. Please try again.");
            response.put("action", "ERROR");
        }
        
        return response;
    }

    private ChatMessage.MessageType determineResponseType(ChatMessage.MessageType requestType) {
        return switch (requestType) {
            case SYMPTOM_QUERY -> ChatMessage.MessageType.SPECIALIST_RESPONSE;
            case HOSPITAL_QUERY -> ChatMessage.MessageType.SYSTEM;
            default -> ChatMessage.MessageType.CHAT;
        };
    }

    private String generateSimilarSymptomsResponse(String symptoms) {
        try {
            var similarSymptoms = semanticSearchService.findSimilarSymptoms(symptoms);
            if (!similarSymptoms.isEmpty()) {
                return "I notice you mentioned these symptoms. Users with similar conditions also reported: " +
                    String.join(", ", similarSymptoms) +
                    "\nWould you like me to provide more information about any of these?";
            }
        } catch (Exception e) {
            log.error("Error generating similar symptoms: {}", e.getMessage());
        }
        return null;
    }

    private void sendResponse(String sessionId, String content, ChatMessage.MessageType type) {
        ChatMessage response = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .content(content)
                .type(type)
                .timestamp(Instant.now())
                .status(ChatMessage.MessageStatus.SENT)
                .build();

        messagingTemplate.convertAndSend("/topic/chat/" + sessionId, response);
    }

    private void sendErrorMessage(String sessionId, String errorMessage) {
        ChatMessage error = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .content(errorMessage)
                .type(ChatMessage.MessageType.SYSTEM)
                .timestamp(Instant.now())
                .status(ChatMessage.MessageStatus.ERROR)
                .build();

        messagingTemplate.convertAndSend("/topic/chat/" + sessionId, error);
    }
} 