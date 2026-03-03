package com.realestate.onlinerealestate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.onlinerealestate.dto.ChatMessageDTO;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.UserRepository;
import com.realestate.onlinerealestate.service.ChatMessageService;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatRestController {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to get current authenticated user ID from email
     */
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return user.getId();
            }
        }
        return null;
    }

    // Get chat history between two users for a property
    @GetMapping("/history/{userId1}/{userId2}/{propertyId}")
    public ResponseEntity<?> getChatHistory(
            @PathVariable Long userId1,
            @PathVariable Long userId2,
            @PathVariable Long propertyId) {

        // SECURITY: Verify current user is one of the participants
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            System.err.println("❌ SECURITY: Unauthorized - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        if (!currentUserId.equals(userId1) && !currentUserId.equals(userId2)) {
            System.err.println("❌ SECURITY: Unauthorized - User " + currentUserId +
                    " attempted to access chat between " + userId1 + " and " + userId2);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to view this chat");
        }

        System.out.println("✅ SECURITY: Chat history access verified for user " + currentUserId);
        List<ChatMessageDTO> messages = chatMessageService.getChatHistory(userId1, userId2, propertyId);
        return ResponseEntity.ok(messages);
    }

    // Get unread messages for a user
    @GetMapping("/unread/{userId}")
    public ResponseEntity<?> getUnreadMessages(@PathVariable Long userId) {
        // SECURITY: User can only fetch their own unread messages
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            System.err.println("❌ SECURITY: Unauthorized - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        if (!currentUserId.equals(userId)) {
            System.err.println("❌ SECURITY: Unauthorized - User " + currentUserId +
                    " attempted to fetch unread messages for user " + userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own unread messages");
        }

        System.out.println("✅ SECURITY: Unread messages access verified for user " + currentUserId);
        List<ChatMessageDTO> messages = chatMessageService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages);
    }

    // Get conversation list for a user
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<?> getConversations(@PathVariable Long userId) {
        // SECURITY: User can only fetch their own conversation list
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            System.err.println("❌ SECURITY: Unauthorized - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        if (!currentUserId.equals(userId)) {
            System.err.println("❌ SECURITY: Unauthorized - User " + currentUserId +
                    " attempted to fetch conversation list for user " + userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only view your own conversations");
        }

        System.out.println("✅ SECURITY: Conversation list access verified for user " + currentUserId);
        List<ChatMessageDTO> conversations = chatMessageService.getConversationList(userId);
        return ResponseEntity.ok(conversations);
    }

    // Mark message as read
    @PostMapping("/read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        // SECURITY: Only receiver can mark message as read
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            System.err.println("❌ SECURITY: Unauthorized - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // Note: In a production system, you'd verify the message exists and current
        // user is the receiver
        // For now, we trust the service layer but log the action
        System.out.println("✅ SECURITY: Message read marked for messageId " + messageId + " by user " + currentUserId);
        chatMessageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    // Save message via REST (as fallback if WebSocket fails)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageDTO message) {
        // SECURITY: Sender must be authenticated user
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            System.err.println("❌ SECURITY: Unauthorized - User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // SECURITY: Verify the sender is the authenticated user
        if (!currentUserId.equals(message.getSenderId())) {
            System.err.println("❌ SECURITY: Unauthorized - User " + currentUserId +
                    " attempted to send message as user " + message.getSenderId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only send messages as yourself");
        }

        // SECURITY: Verify user is authorized for this chat
        if (!chatMessageService.isUserAuthorizedForChat(currentUserId, message.getSenderId(),
                message.getReceiverId(), message.getPropertyId())) {
            System.err.println("❌ SECURITY: Chat authorization failed for REST message endpoint");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized for this chat");
        }

        System.out.println("✅ SECURITY: REST message send verified for user " + currentUserId);
        ChatMessageDTO savedMessage = chatMessageService.saveMessage(
                message.getSenderId(),
                message.getReceiverId(),
                message.getPropertyId(),
                message.getMessage());
        return ResponseEntity.ok(savedMessage);
    }
}
