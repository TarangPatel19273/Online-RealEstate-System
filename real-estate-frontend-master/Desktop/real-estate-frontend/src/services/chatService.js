import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE } from '../config';

class ChatService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.currentUserId = null;
    this.subscriptions = {}; // Track subscriptions by path
  }

  /**
   * MESSAGE FLOW - STEP 1-4: Connect WebSocket
   * 1. Client initiates WebSocket connection with JWT token
   * 2. Spring Boot validates token in handshake interceptor
   * 3. Sets user principal for routing
   * 4. Client subscribes to /user/{userId}/queue/messages
   */
  connect(userId, onConnect, onError) {
    // Prevent multiple connections
    if (this.isConnected) {
      console.log('✅ WebSocket already connected');
      if (onConnect) onConnect();
      return;
    }

    this.currentUserId = userId;
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No JWT token found in localStorage');
      if (onError) onError('No authentication token');
      return;
    }

    if (!userId) {
      console.error('❌ No userId provided');
      if (onError) onError('No userId provided');
      return;
    }

    console.log(`📡 STEP 1: Initiating WebSocket connection for userId: ${userId}`);
    
    // Create SockJS socket with userId and token as query parameters
    // (SockJS doesn't support custom headers, so we pass them as query params)
    const socket = new SockJS(`${API_BASE}/ws-chat?userId=${userId}&token=${token}`);
    
    this.client = new Client({
      webSocketFactory: () => socket,
      // Send auth credentials in headers
      connectHeaders: {
        'Authorization': `Bearer ${token}`,
        'userId': userId.toString(),
        'X-User-Id': userId.toString()
      },
      debug: (str) => {
        // Enable for detailed STOMP frames: console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = (frame) => {
      this.isConnected = true;
      console.log('✅ STEP 2: WebSocket Connected - STOMP frame received');

      // Subscribe to user's message queue
      const subscriptionPath = `/user/${userId}/queue/messages`;
      console.log(`📡 STEP 3: Subscribing to personal queue: ${subscriptionPath}`);
      
      const subscription = this.client.subscribe(subscriptionPath, (message) => {
        try {
          const chatMessage = JSON.parse(message.body);
          console.log(`📨 STEP 8: Message received in personal queue`);
          console.log('   From userId:', chatMessage.senderId, '→ To userId:', chatMessage.receiverId);
          console.log('   Property:', chatMessage.propertyId, '| Message:', chatMessage.message);
          
          // Notify all listeners about received message
          this.messageListeners.forEach(listener => {
            try {
              listener(chatMessage);
            } catch (e) {
              console.error('Error in message listener:', e);
            }
          });
        } catch (e) {
          console.error('❌ Error parsing message:', e);
        }
      });
      
      // Store subscription reference
      this.subscriptions[subscriptionPath] = subscription;
      console.log('✅ STEP 4: Successfully subscribed - ready to receive messages');

      if (onConnect) onConnect();
      
      // Notify connection status listeners
      this.connectionListeners.forEach(listener => {
        try {
          listener(true);
        } catch (e) {
          console.error('Error in connection listener:', e);
        }
      });
    };

    // Handle STOMP protocol errors
    this.client.onStompError = (frame) => {
      console.error('❌ STOMP Protocol Error:', frame);
      if (onError) onError(frame);
      this.connectionListeners.forEach(listener => listener(false));
    };

    // Handle WebSocket errors
    this.client.onWebSocketError = (error) => {
      console.error('❌ WebSocket Error (likely 403 - check security):', error);
      if (onError) onError(error);
    };

    // Handle disconnect
    this.client.onDisconnect = () => {
      this.isConnected = false;
      console.log('🔌 WebSocket Disconnected');
      this.connectionListeners.forEach(listener => listener(false));
    };

    console.log('⏳ Activating STOMP client...');
    this.client.activate();
  }

  disconnect() {
    if (this.client && this.isConnected) {
      console.log('Disconnecting WebSocket...');
      this.client.deactivate();
    }
  }

  /**
   * MESSAGE FLOW - STEP 5-8: Send and Receive Message
   * 5. Client publishes message to /app/chat/{receiverId}/{propertyId}
   * 6. Spring Boot receives in ChatController, saves to database
   * 7. Spring sends message back to both sender and receiver via /user/{userId}/queue/messages
   * 8. Client receives message in subscription callback
   */
  sendMessage(senderId, receiverId, propertyId, message) {
    if (!this.isConnected || !this.client) {
      console.warn('❌ WebSocket not connected. Message not sent.');
      console.log('Connection status:', { isConnected: this.isConnected, clientExists: !!this.client });
      return false;
    }

    if (!message || message.trim() === '') {
      console.warn('Empty message, not sending');
      return false;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const chatMessage = {
        senderId: senderId,
        senderUsername: user.username || 'User',
        receiverId: receiverId,
        message: message,
        propertyId: propertyId,
        timestamp: new Date().toISOString()
      };

      // Publish to backend chat endpoint
      const destination = `/app/chat/${receiverId}/${propertyId}`;
      console.log(`📤 STEP 5: Publishing message to server`);
      console.log('   Destination:', destination);
      console.log('   From userId:', senderId, '→ To userId:', receiverId);
      console.log('   Property:', propertyId);
      console.log('   Message:', message);
      
      this.client.publish({
        destination: destination,
        body: JSON.stringify(chatMessage)
      });

      console.log('✅ STEP 6a: Message published to Spring Backend');
      console.log('   (Server now saves to DB, then routes to both users)');
      return true;
    } catch (e) {
      console.error('❌ Error sending message:', e);
      return false;
    }
  }

  onMessageReceived(callback) {
    this.messageListeners.push(callback);
  }

  onConnectionStatusChanged(callback) {
    this.connectionListeners.push(callback);
  }

  removeMessageListener(callback) {
    this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
  }

  removeConnectionListener(callback) {
    this.connectionListeners = this.connectionListeners.filter(listener => listener !== callback);
  }
}

export default new ChatService();
