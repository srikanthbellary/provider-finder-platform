package com.healthcare.chatservice.controller;

import com.healthcare.chatservice.model.ChatMessage;
import com.healthcare.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        log.debug("Received message: {}", chatMessage);
        chatService.handleMessage(chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        log.debug("User joined: {}", chatMessage.getUserId());
        headerAccessor.getSessionAttributes().put("userId", chatMessage.getUserId());
        headerAccessor.getSessionAttributes().put("sessionId", chatMessage.getSessionId());
        chatService.handleMessage(chatMessage);
    }
    
    @GetMapping("/api/chat/health")
    @ResponseBody
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running");
    }
    
    @PostMapping("/api/chat/message")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> processMessage(@RequestBody Map<String, String> request) {
        String message = request.getOrDefault("message", "");
        log.debug("Received REST message: {}", message);
        
        Map<String, Object> response = chatService.processRestMessage(message);
        return ResponseEntity.ok(response);
    }
} 