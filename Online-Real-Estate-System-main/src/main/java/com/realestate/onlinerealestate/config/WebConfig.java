package com.realestate.onlinerealestate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = Paths.get("uploads").toAbsolutePath().normalize().toUri().toString();
        
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath);
            
        System.out.println("Static resources mapped: /uploads/** -> " + uploadPath);
    }
}
