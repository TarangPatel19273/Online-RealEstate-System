package com.realestate.onlinerealestate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String uploadPath = "file:" + Paths.get("uploads").toAbsolutePath().toString().replace("\\", "/") + "/";
        
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath);
            
        System.out.println("Static resources mapped: /uploads/** -> " + uploadPath);
    }
}
