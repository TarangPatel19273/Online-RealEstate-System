package com.realestate.onlinerealestate.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.onlinerealestate.dto.ChatMessageDTO;
import com.realestate.onlinerealestate.model.ChatMessage;
import com.realestate.onlinerealestate.model.Property;
import com.realestate.onlinerealestate.model.User;
import com.realestate.onlinerealestate.repository.ChatMessageRepository;
import com.realestate.onlinerealestate.repository.PropertyRepository;
import com.realestate.onlinerealestate.repository.UserRepository;

@Service
@Transactional
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    // Save a new message
    public ChatMessageDTO saveMessage(Long senderId, Long receiverId, Long propertyId, String message) {
        try {
            System.out.println("\n--- ChatMessageService.saveMessage() START ---");
            System.out.println("Input parameters:");
            System.out.println("  senderId: " + senderId);
            System.out.println("  receiverId: " + receiverId);
            System.out.println("  propertyId: " + propertyId);
            System.out.println("  message: " + message);
            
            // Find sender
            System.out.println("\n1️⃣ Finding sender with ID: " + senderId);
            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + senderId));
            System.out.println("   ✅ Found sender: " + sender.getUsername());
            
            // Find receiver
            System.out.println("2️⃣ Finding receiver with ID: " + receiverId);
            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + receiverId));
            System.out.println("   ✅ Found receiver: " + receiver.getUsername());
            
            // Find property
            System.out.println("3️⃣ Finding property with ID: " + propertyId);
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found with ID: " + propertyId));
            System.out.println("   ✅ Found property: " + property.getTitle());

            // Create chat message
            System.out.println("4️⃣ Creating ChatMessage object...");
            ChatMessage chatMessage = new ChatMessage(sender, receiver, property, message);
            chatMessage.setTimestamp(LocalDateTime.now());
            System.out.println("   ✅ ChatMessage created with timestamp: " + chatMessage.getTimestamp());
            
            // Save to database
            System.out.println("5️⃣ Saving to database...");
            ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
            System.out.println("   ✅ SAVED! Message ID: " + savedMessage.getId());
            
            // Convert to DTO
            System.out.println("6️⃣ Converting to DTO...");
            ChatMessageDTO dto = convertToDTO(savedMessage);
            System.out.println("   ✅ DTO created with ID: " + dto.getId());
            System.out.println("--- ChatMessageService.saveMessage() END ---\n");
            
            return dto;
        } catch (Exception e) {
            System.err.println("\n❌ ERROR in ChatMessageService.saveMessage()");
            System.err.println("   Exception Type: " + e.getClass().getSimpleName());
            System.err.println("   Message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save message: " + e.getMessage(), e);
        }
    }

    // Get chat history between two users for a property
    public List<ChatMessageDTO> getChatHistory(Long userId1, Long userId2, Long propertyId) {
        System.out.println("\n--- ChatMessageService.getChatHistory() START ---");
        System.out.println("Looking for messages between userId1: " + userId1 + 
                         ", userId2: " + userId2 + ", propertyId: " + propertyId);
        
        List<ChatMessage> messages = chatMessageRepository.findChatHistoryBetweenUsers(userId1, userId2, propertyId);
        
        System.out.println("Found " + messages.size() + " messages");
        
        // Mark as read
        messages.forEach(msg -> {
            if (msg.getReceiver().getId().equals(userId1) && !msg.isRead()) {
                msg.setRead(true);
                chatMessageRepository.save(msg);
                System.out.println("   Marked message ID " + msg.getId() + " as read");
            } else if (msg.getReceiver().getId().equals(userId2) && !msg.isRead()) {
                msg.setRead(true);
                chatMessageRepository.save(msg);
                System.out.println("   Marked message ID " + msg.getId() + " as read");
            }
        });

        List<ChatMessageDTO> result = messages.stream().map(this::convertToDTO).collect(Collectors.toList());
        System.out.println("--- ChatMessageService.getChatHistory() END ---\n");
        return result;
    }

    // Get all unread messages for a user
    public List<ChatMessageDTO> getUnreadMessages(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findByReceiverIdAndIsReadFalse(userId);
        return messages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Mark message as read
    public void markAsRead(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        chatMessageRepository.save(message);
    }

    // Get conversation list for a user (list of unique users they've chatted with)
    public List<ChatMessageDTO> getConversationList(Long userId) {
        List<ChatMessage> allMessages = chatMessageRepository.findBySenderIdOrReceiverId(userId, userId);
        return allMessages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // SECURITY: Validate that the user is either sender or receiver of the chat
    public boolean isUserAuthorizedForChat(Long userId, Long senderId, Long receiverId, Long propertyId) {
        // User must be either sender or receiver
        if (!userId.equals(senderId) && !userId.equals(receiverId)) {
            System.out.println("❌ SECURITY: Unauthorized chat access attempt. UserId " + userId + 
                             " is neither sender (" + senderId + ") nor receiver (" + receiverId + ")");
            return false;
        }

        // Verify that the receiver actually exists
        if (!userRepository.existsById(receiverId)) {
            System.out.println("❌ SECURITY: Receiver not found");
            return false;
        }

        // Verify sender is the current user
        if (!userId.equals(senderId)) {
            System.out.println("❌ SECURITY: UserId " + userId + " attempting to send message as " + senderId);
            return false;
        }

        System.out.println("✅ SECURITY: Chat authorization verified for userId " + userId + 
                         ", chatting with " + receiverId + " about property " + propertyId);
        return true;
    }

    // Helper method to convert ChatMessage to ChatMessageDTO
    private ChatMessageDTO convertToDTO(ChatMessage chatMessage) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(chatMessage.getId());
        dto.setSenderId(chatMessage.getSender().getId());
        dto.setSenderUsername(chatMessage.getSender().getUsername());
        dto.setReceiverId(chatMessage.getReceiver().getId());
        dto.setReceiverUsername(chatMessage.getReceiver().getUsername());
        dto.setPropertyId(chatMessage.getProperty().getId());
        dto.setMessage(chatMessage.getMessage());
        dto.setTimestamp(chatMessage.getTimestamp());
        dto.setRead(chatMessage.isRead());
        return dto;
    }
}
