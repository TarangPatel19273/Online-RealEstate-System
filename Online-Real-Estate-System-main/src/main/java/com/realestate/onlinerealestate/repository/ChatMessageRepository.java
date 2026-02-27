package com.realestate.onlinerealestate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.onlinerealestate.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Get all messages between two users for a specific property
    // Using @Query to properly handle the OR condition
    @Query("SELECT m FROM ChatMessage m WHERE m.property.id = :propertyId AND " +
           "((m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.receiver.id = :userId1)) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistoryBetweenUsers(
        @Param("userId1") Long userId1,
        @Param("userId2") Long userId2,
        @Param("propertyId") Long propertyId
    );

    // Get all unread messages for a user
    List<ChatMessage> findByReceiverIdAndIsReadFalse(Long receiverId);

    // Get conversation list for a user
    List<ChatMessage> findBySenderIdOrReceiverId(Long senderId, Long receiverId);

    // Get messages by property
    List<ChatMessage> findByPropertyId(Long propertyId);
}
