package com.realestate.onlinerealestate.security;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

        // ✅ MUST be at least 256 bits for HS256
        private static final String SECRET = "realestate_realestate_realestate_realestate_256bit_key";

        private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

        public String generateToken(String email) {

                return Jwts.builder()
                                .setSubject(email)
                                .setIssuedAt(new Date())
                                .setExpiration(
                                                new Date(System.currentTimeMillis() + 864000000) // 10 days
                                )
                                .signWith(key) // ✅ CORRECT
                                .compact();
        }

        public String extractEmail(String token) {
                return Jwts.parserBuilder()
                                .setSigningKey(key)
                                .build()
                                .parseClaimsJws(token)
                                .getBody()
                                .getSubject();
        }
}
