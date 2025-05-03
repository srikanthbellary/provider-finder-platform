package com.healthcare.chatservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Arrays;

@Slf4j
@Service
public class AIService {
    private final ConcurrentHashMap<String, String> responseCache = new ConcurrentHashMap<>();
    
    // Common symptom keywords to specialist mapping
    private final List<String[]> symptomKeywords = Arrays.asList(
        new String[]{"heart", "chest pain", "blood pressure", "Cardiologist"},
        new String[]{"lung", "breathing", "cough", "respiratory", "Pulmonologist"},
        new String[]{"skin", "rash", "acne", "dermatitis", "Dermatologist"},
        new String[]{"bone", "joint", "muscle", "back pain", "fracture", "Orthopedist"},
        new String[]{"nerve", "headache", "migraine", "seizure", "memory", "Neurologist"},
        new String[]{"stomach", "digestion", "nausea", "abdominal", "Gastroenterologist"},
        new String[]{"kidney", "bladder", "urination", "Urologist"},
        new String[]{"eye", "vision", "sight", "Ophthalmologist"},
        new String[]{"ear", "nose", "throat", "hearing", "Otolaryngologist"},
        new String[]{"pregnancy", "menstrual", "gynecological", "Gynecologist"},
        new String[]{"mental health", "depression", "anxiety", "mood", "Psychiatrist"},
        new String[]{"allergy", "immune", "infection", "Immunologist"},
        new String[]{"diabetes", "hormone", "thyroid", "Endocrinologist"},
        new String[]{"cancer", "tumor", "oncology", "Oncologist"}
    );

    public String generateResponse(String prompt) {
        // Check cache first
        String cachedResponse = responseCache.get(prompt);
        if (cachedResponse != null) {
            return cachedResponse;
        }

        // Simple response generation logic
        String response = "I understand your concern. ";
        
        if (prompt.toLowerCase().contains("symptoms")) {
            response += "Based on the symptoms you described, I recommend talking to a healthcare provider. ";
            response += "Would you like me to help you find a specialist?";
        } else if (prompt.toLowerCase().contains("specialist")) {
            response += "I can help you find an appropriate specialist based on your symptoms. ";
            response += "Please describe what you're experiencing.";
        } else {
            response += "I'm here to help you find the right healthcare provider. ";
            response += "Could you please tell me more about your symptoms?";
        }
        
        // Cache the response
        responseCache.put(prompt, response);
        return response;
    }

    public String generateHealthGuidance(String symptoms) {
        String response = "Based on the symptoms you described, here is some general guidance:\n\n";
        response += "1. Possible causes: There could be several causes for your symptoms.\n";
        response += "2. Recommended actions: Monitor your symptoms and consider consulting a healthcare provider.\n";
        response += "3. When to seek immediate medical attention: If you experience severe pain, difficulty breathing, or loss of consciousness, seek emergency care immediately.\n\n";
        response += "Remember, this is just general guidance and not a medical diagnosis.";
        
        return response;
    }

    public String generateSpecialistRecommendation(String symptoms) {
        String lowerCaseSymptoms = symptoms.toLowerCase();
        
        // Check for keyword matches
        for (String[] entry : symptomKeywords) {
            for (int i = 0; i < entry.length - 1; i++) {
                if (lowerCaseSymptoms.contains(entry[i].toLowerCase())) {
                    return entry[entry.length - 1]; // Last entry is the specialist
                }
            }
        }
        
        // Default recommendation
        return "General Physician";
    }
} 