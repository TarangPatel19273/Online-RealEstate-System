import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import chatService from "../services/chatService";
import axiosConfig from "../services/axiosConfig";

function Chat({ propertyId, receiverId, receiverUsername, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messageListenerRef = useRef(null);
  const connectedRef = useRef(false);
  const sentMessagesRef = useRef(new Set());

  useEffect(() => {
    // Get current user info
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  // Load chat history on mount
  useEffect(() => {
    if (currentUser && currentUser.id) {
      // Reset connection flag when receiver or property changes (chat reopened with different person/property)
      connectedRef.current = false;
      loadChatHistory();
      connectWebSocket();
    }
    
    return () => {
      if (messageListenerRef.current) {
        chatService.removeMessageListener(messageListenerRef.current);
      }
    };
  }, [currentUser, receiverId, propertyId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      console.log(`📚 STEP 1: Loading chat history from REST API`);
      console.log(`   Current User ID: ${currentUser.id}`);
      console.log(`   Receiver ID: ${receiverId}`);
      console.log(`   Property ID: ${propertyId}`);
      console.log(`   URL: /chat/history/${currentUser.id}/${receiverId}/${propertyId}`);
      
      const response = await axiosConfig.get(
        `/chat/history/${currentUser.id}/${receiverId}/${propertyId}`
      );
      
      const loadedMessages = response.data || [];
      console.log(`✅ STEP 1: Loaded ${loadedMessages.length} previous messages from database`);
      
      if (loadedMessages.length === 0) {
        console.log("   ℹ️ No previous messages found. Starting fresh conversation.");
      } else {
        loadedMessages.forEach((msg, index) => {
          console.log(`   Message ${index + 1}: ${msg.senderUsername} → ${msg.receiverUsername}: "${msg.message}"`);
        });
      }
      
      setMessages(loadedMessages);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
      console.error("   Error details:", error.response?.data || error.message);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!chatService.isConnected) {
      console.log(`📡 STEP 2: Initiating WebSocket connection...`);
      chatService.connect(
        currentUser.id,
        () => {
          console.log(`✅ STEP 4: WebSocket ready - registered to receive messages`);
        },
        (error) => {
          console.error("❌ WebSocket error:", error);
        }
      );
    }

    // Create unique listener for this conversation
    const messageListener = (incomingMessage) => {
      // Check if message belongs to this conversation
      const isPartOfConversation = 
        incomingMessage.propertyId === propertyId &&
        ((incomingMessage.senderId === currentUser.id && incomingMessage.receiverId === receiverId) ||
         (incomingMessage.senderId === receiverId && incomingMessage.receiverId === currentUser.id));

      if (isPartOfConversation) {
        console.log(`✅ STEP 8: Message delivered to Chat component`);
        console.log('   From:', incomingMessage.senderUsername, '→ To:', receiverUsername);
        
        setMessages((prevMessages) => {
          // Create a unique key for this message (combination of sender, receiver, timestamp, and content)
          const messageKey = `${incomingMessage.senderId}-${incomingMessage.receiverId}-${incomingMessage.timestamp}-${incomingMessage.message}`;
          
          // Check if message already exists to avoid duplicates
          const messageExists = prevMessages.some(msg => {
            const existingKey = `${msg.senderId}-${msg.receiverId}-${msg.timestamp}-${msg.message}`;
            return existingKey === messageKey;
          });
          
          if (!messageExists) {
            console.log('   ✅ Added to message list and displayed');
            // Remove the optimistic message if this is the confirmed version
            sentMessagesRef.current.delete(messageKey);
            return [...prevMessages, incomingMessage];
          } else {
            console.log('   ↩️ Duplicate message filtered out');
            return prevMessages;
          }
        });
      } else {
        console.log("↩️ Message filtered (not part of this conversation)");
      }
    };

    // Store listener reference for cleanup
    messageListenerRef.current = messageListener;
    chatService.onMessageReceived(messageListener);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (inputMessage.trim() === "") return;

    console.log(`📤 STEP 5: User sends message from Chat form`);
    console.log(`   Message: "${inputMessage}"`);
    
    // Send via WebSocket
    const sent = chatService.sendMessage(currentUser.id, receiverId, propertyId, inputMessage);

    if (sent) {
      // DON'T add optimistic message to state
      // Instead, wait for the server confirmation through WebSocket to avoid duplicates
      // The server sends the message back through the WebSocket listener
      
      console.log(`✅ STEP 7: Message sent to server, waiting for confirmation`);

      // Clear input
      setInputMessage("");
    } else {
      console.warn(`❌ Failed to send message - WebSocket may not be connected`);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>Chat with {receiverUsername}</h2>
          <p className="chat-property-info">Property ID: {propertyId}</p>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.senderId === currentUser.id ? "sent" : "received"
              }`}
            >
              <div className="message-bubble">
                <p className="message-text">{msg.message}</p>
                <small className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
