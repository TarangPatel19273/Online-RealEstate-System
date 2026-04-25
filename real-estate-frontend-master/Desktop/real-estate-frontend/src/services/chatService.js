import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE } from '../config';

/**
 * Singleton service responsible for managing the STOMP/SockJS WebSocket connection.
 * Handles connecting, disconnecting, subscribing to specific message queues,
 * and broadcasting messages to connected React components via listeners.
 */
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
      if (onConnect) onConnect();
      return;
    }

    // If client is already initializing, don't create another one
    if (this.client && this.client.active) {
      // Just wait for it to connect
      this.onConnectionStatusChanged((status) => {
        if (status && onConnect) onConnect();
      });
      return;
    }

    this.currentUserId = userId;

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      if (onError) onError('No authentication token');
      return;
    }

    if (!userId) {
      if (onError) onError('No userId provided');
      return;
    }



    // Create SockJS socket with userId and token as query parameters
    // (SockJS doesn't support custom headers, so we pass them as query params)
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws-chat?userId=${userId}&token=${token}`),
      // Send auth credentials in headers
      connectHeaders: {
        'Authorization': `Bearer ${token}`,
        'userId': userId.toString(),
        'X-User-Id': userId.toString()
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = (frame) => {
      this.isConnected = true;

      // Subscribe to user's message queue
      const subscriptionPath = `/user/${userId}/queue/messages`;
      const subscription = this.client.subscribe(subscriptionPath, (message) => {
        try {
          const chatMessage = JSON.parse(message.body);

          // Notify all listeners about received message
          this.messageListeners.forEach(listener => {
            try {
              listener(chatMessage);
            } catch (e) {
              // Ignored
            }
          });
        } catch (e) {
          // Ignored
        }
      });

      // Store subscription reference
      this.subscriptions[subscriptionPath] = subscription;

      if (onConnect) onConnect();

      // Notify connection status listeners
      this.connectionListeners.forEach(listener => {
        try {
          listener(true);
        } catch (e) {
          // Ignored
        }
      });
    };

    // Handle STOMP protocol errors
    this.client.onStompError = (frame) => {
      if (onError) onError(frame);
      this.connectionListeners.forEach(listener => listener(false));
    };

    // Handle WebSocket errors
    this.client.onWebSocketError = (error) => {
      if (onError) onError(error);
    };

    // Handle disconnect
    this.client.onDisconnect = () => {
      this.isConnected = false;
      this.connectionListeners.forEach(listener => listener(false));
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.isConnected) {
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
    if (!this.client || !this.client.connected) {
      return false;
    }

    if (!message || message.trim() === '') {
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

      this.client.publish({
        destination: destination,
        body: JSON.stringify(chatMessage)
      });

      return true;
    } catch (e) {
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

const chatServiceInstance = new ChatService();
export default chatServiceInstance;
