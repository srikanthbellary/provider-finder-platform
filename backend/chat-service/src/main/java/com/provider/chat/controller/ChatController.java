package com.provider.chat.controller;

import com.provider.chat.service.SymptomMappingService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // For development only, restrict in production
public class ChatController {
    private final SymptomMappingService symptomMappingService;

    public ChatController(SymptomMappingService symptomMappingService) {
        this.symptomMappingService = symptomMappingService;
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running");
    }
    
    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> handleMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Message cannot be empty"));
        }
        
        Optional<String> specialist = symptomMappingService.findSpecialist(message);
        Map<String, Object> response = new HashMap<>();
        
        if (specialist.isPresent()) {
            response.put("specialist", specialist.get());
            response.put("message", "Based on your symptoms, I recommend consulting a " + specialist.get() + 
                ". Would you like me to help you find one near you?");
            response.put("action", "FIND_PROVIDER");
        } else {
            response.put("message", "I understand you're not feeling well. Could you please describe your symptoms in more detail? " +
                "This will help me recommend the most appropriate specialist.");
            response.put("action", "CONTINUE_CHAT");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/specialists")
    public ResponseEntity<Map<String, Object>> getTopSpecialists(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Message cannot be empty"));
        }
        
        // Get top 3 specialists for the symptoms
        List<String> specialists = symptomMappingService.findTopSpecialists(message, 3);
        
        Map<String, Object> response = new HashMap<>();
        if (!specialists.isEmpty()) {
            response.put("specialists", specialists);
            
            String specialistList = specialists.stream()
                .collect(Collectors.joining(", "));
                
            response.put("message", "Based on your symptoms, you might consider consulting: " + specialistList + 
                ". Would you like to find providers in any of these specialties?");
            response.put("action", "SELECT_SPECIALIST");
        } else {
            response.put("message", "I couldn't determine appropriate specialists from your message. " +
                "Please provide more details about your symptoms.");
            response.put("action", "CONTINUE_CHAT");
        }
        
        return ResponseEntity.ok(response);
    }
} 