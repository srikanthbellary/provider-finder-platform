package com.healthcare.chatservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String id;
    private String sessionId;
    private String userId;
    private String content;
    private MessageType type;
    private Instant timestamp;
    private MessageStatus status;

    public enum MessageType {
        CHAT,
        SYMPTOM_QUERY,
        SPECIALIST_RESPONSE,
        HOSPITAL_QUERY,
        SYSTEM
    }

    public enum MessageStatus {
        SENT,
        DELIVERED,
        READ,
        ERROR
    }
} 