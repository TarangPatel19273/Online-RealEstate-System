package com.realestate.onlinerealestate.config;

import java.security.Principal;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

/**
 * Channel interceptor to set user principal for WebSocket messages
 */
@Component
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(message);
        
        try {
            // Get userId from session attributes (set by handshake interceptor)
            // Only set principal if it's not already set
            if (accessor.getUser() == null && accessor.getSessionAttributes() != null) {
                Object userIdAttr = accessor.getSessionAttributes().get("userId");
                
                if (userIdAttr != null) {
                    String userId = (String) userIdAttr;
                    // Set user principal with userId
                    accessor.setUser(new SimplePrincipal(userId));
                    System.out.println("WebSocket principal set to userId: " + userId);
                }
            }
        } catch (Exception e) {
            System.err.println("Error setting WebSocket principal: " + e.getMessage());
            e.printStackTrace();
        }
        
        return message;
    }

    /**
     * Simple principal implementation for WebSocket user identification
     */
    public static class SimplePrincipal implements Principal {
        private final String name;

        public SimplePrincipal(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String toString() {
            return name;
        }
    }
}
