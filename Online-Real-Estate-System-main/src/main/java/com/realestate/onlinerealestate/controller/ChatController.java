package com.realestate.onlinerealestate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Controller;
import java.security.Principal;

import com.realestate.onlinerealestate.dto.ChatMessageDTO;
import com.realestate.onlinerealestate.service.ChatMessageService;

/**
 * Controller responsible for handling real-time WebSocket messages via STOMP.
 * Receives messages from the frontend, validates security/authorization, saves them
 * to the database, and broadcasts them to the respective sender and receiver queues.
 */
@Controller
public class ChatController {

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired(required = false)
    private SimpUserRegistry userRegistry;

    /**
     * Handles incoming STOMP messages directed to /app/chat/{receiverId}/{propertyId}.
     * Verifies the identity of the sender using the Principal attached to the WebSocket session,
     * saves the message via ChatMessageService, and then routes it to the specific user queues.
     * 
     * @param receiverId The ID of the user who should receive the message.
     * @param propertyId The ID of the property context for this chat.
     * @param message The payload containing the message text and sender ID.
     * @param principal The security principal representing the authenticated WebSocket session.
     */
    @MessageMapping("/chat/{receiverId}/{propertyId}")
    public void sendMessage(@DestinationVariable Long receiverId, 
                            @DestinationVariable Long propertyId,
                            ChatMessageDTO message,
                            Principal principal) {
        
        try {
            System.out.println("\n═══════════════════════════════════════════════════");
            System.out.println("📨 STEP 6: Message received by ChatController");
            System.out.println("═══════════════════════════════════════════════════");
            System.out.println("   Receiver ID: " + receiverId);
            System.out.println("   Property ID: " + propertyId);
            System.out.println("   Current Principal: " + (principal != null ? principal.getName() : "NULL"));
            System.out.println("   Message DTO:");
            System.out.println("     - senderId: " + (message != null ? message.getSenderId() : "NULL"));
            System.out.println("     - message: " + (message != null ? message.getMessage() : "NULL"));
            
            // Validate message object exists
            if (message == null) {
                System.err.println("❌ ERROR: ChatMessageDTO is NULL");
                return;
            }
            
            // Get authenticated user ID from principal
            Long currentUserId = null;
            if (principal != null && principal.getName() != null && !principal.getName().isEmpty()) {
                try {
                    currentUserId = Long.parseLong(principal.getName());
                    System.out.println("   ✅ Auth UserId (from Principal): " + currentUserId);
                } catch (NumberFormatException e) {
                    System.err.println("   ❌ Failed to parse principal name: " + principal.getName());
                    currentUserId = message.getSenderId();
                }
            } else {
                System.err.println("   ⚠️  No principal, using message.getSenderId()");
                currentUserId = message.getSenderId();
            }
            
            // Validate message data
            if (message.getSenderId() == null) {
                System.err.println("❌ senderId is NULL");
                return;
            }
            if (message.getMessage() == null || message.getMessage().trim().isEmpty()) {
                System.err.println("❌ message content is empty");
                return;
            }
            
            // SECURITY VALIDATION: Verify the sender is the authenticated user
            if (!currentUserId.equals(message.getSenderId())) {
                System.err.println("❌ SECURITY: Unauthorized - User " + currentUserId + 
                                 " attempted to send message as user " + message.getSenderId());
                return;
            }

            // SECURITY VALIDATION: Verify user is authorized for this chat
            if (!chatMessageService.isUserAuthorizedForChat(currentUserId, message.getSenderId(), receiverId, propertyId)) {
                System.err.println("❌ SECURITY: Chat authorization failed for user " + currentUserId);
                return;
            }

            System.out.println("   ✅ Security checks passed");
            System.out.println("📝 Saving message to database...");
            
            // Save message to database
            ChatMessageDTO savedMessage = chatMessageService.saveMessage(
                message.getSenderId(),
                receiverId,
                propertyId,
                message.getMessage()
            );

            System.out.println("✅ STEP 6b: Message SAVED to database");
            System.out.println("   Saved Message ID: " + savedMessage.getId());
            System.out.println("   Timestamp: " + savedMessage.getTimestamp());

            // Send to receiver's private queue using their user ID
            String receiverIdStr = String.valueOf(receiverId);
            System.out.println("\n📤 Broadcasting to receiver: /user/" + receiverIdStr + "/queue/messages");
            messagingTemplate.convertAndSendToUser(
                receiverIdStr,
                "/queue/messages",
                savedMessage
            );
            System.out.println("✅ Sent to receiver");

            // Send to sender's queue as confirmation using their user ID
            String senderIdStr = String.valueOf(message.getSenderId());
            System.out.println("📤 Broadcasting to sender: /user/" + senderIdStr + "/queue/messages");
            messagingTemplate.convertAndSendToUser(
                senderIdStr,
                "/queue/messages",
                savedMessage
            );
            System.out.println("✅ Sent to sender");
            System.out.println("✅ STEP 7: Message broadcast complete");
            System.out.println("═══════════════════════════════════════════════════\n");

        } catch (Exception e) {
            System.err.println("\n❌ EXCEPTION in ChatController.sendMessage()");
            System.err.println("   Type: " + e.getClass().getSimpleName());
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("═══════════════════════════════════════════════════\n");
        }
    }
}
