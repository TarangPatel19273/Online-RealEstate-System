package com.realestate.onlinerealestate.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Interceptor to extract JWT token and user ID from WebSocket handshake
 */
@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, 
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        try {
            String userId = null;
            String token = null;

            // Method 1: Try to get from headers (for standard WebSocket)
            String userIdHeader = request.getHeaders().getFirst("userId");
            if (userIdHeader != null && !userIdHeader.isEmpty()) {
                userId = userIdHeader;
                System.out.println("✅ WebSocket userId from header: " + userId);
            }

            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                System.out.println("✅ WebSocket token from Authorization header");
            }

            // Method 2: Try to get from query parameters (for SockJS fallback)
            String query = request.getURI().getQuery();
            if (query != null && !query.isEmpty()) {
                String[] params = query.split("&");
                for (String param : params) {
                    if (param.startsWith("userId=")) {
                        userId = param.substring(7);
                        System.out.println("✅ WebSocket userId from query param: " + userId);
                    } else if (param.startsWith("token=")) {
                        token = param.substring(6);
                        System.out.println("✅ WebSocket token from query param");
                    }
                }
            }

            // Store in attributes for later use
            if (userId != null && !userId.isEmpty()) {
                // Validate userId is numeric
                try {
                    Long.parseLong(userId);
                    attributes.put("userId", userId);
                    System.out.println("✅ WebSocket userId validated: " + userId);
                } catch (NumberFormatException e) {
                    System.err.println("❌ Invalid userId format (not numeric): " + userId);
                    attributes.put("userId", userId); // Still store for logging
                }
            }
            if (token != null) {
                attributes.put("token", token);
                System.out.println("✅ WebSocket JWT token extracted and stored");
            }

            // Log what we found
            if (userId == null || token == null) {
                System.out.println("⚠️  WebSocket handshake incomplete - userId: " + (userId != null ? "✓" : "✗") + 
                                 ", token: " + (token != null ? "✓" : "✗"));
                System.out.println("Request headers: " + request.getHeaders());
                System.out.println("Request URI: " + request.getURI());
            }

            return true;

        } catch (Exception e) {
            System.err.println("❌ WebSocket handshake error: " + e.getMessage());
            e.printStackTrace();
            return true; // Allow connection even on error
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            System.err.println("❌ WebSocket handshake failed after connection: " + exception.getMessage());
        } else {
            System.out.println("✅ WebSocket handshake completed successfully");
        }
    }
}
