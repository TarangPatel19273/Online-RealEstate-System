package com.realestate.onlinerealestate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.realestate.onlinerealestate.security.JwtRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // ✅ AUTH APIs
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ WEBSOCKET ENDPOINTS
                        .requestMatchers("/ws-chat/**").permitAll()
                        .requestMatchers("/ws-chat").permitAll()

                        // ✅ PROPERTY UPLOAD API
                        .requestMatchers("/api/properties/**").permitAll()

                        // ✅ CHAT REST APIs - REQUIRES AUTHENTICATION
                        .requestMatchers("/chat/**").authenticated()

                        // ✅ USER APIs (for getting user info by email)
                        .requestMatchers("/api/user/**").permitAll()

                        // ✅ WISHLIST API (Controller handles auth)
                        .requestMatchers("/api/wishlist/**").permitAll()

                        // ✅ STATIC RESOURCES (Images)
                        .requestMatchers("/uploads/**").permitAll()

                        // ✅ OPTIONS (CORS preflight)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // 🔒 everything else secured
                        .anyRequest().authenticated());

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ CORS CONFIG (VERY IMPORTANT)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Content-Type", 
            "Authorization", 
            "X-Requested-With",
            "userId",
            "X-User-Id",
            "Sec-WebSocket-Extensions",
            "Sec-WebSocket-Key",
            "Sec-WebSocket-Version"
        ));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
