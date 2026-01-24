package com.example.english.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Autowired
    private AppConfig appConfig;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow all local development origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:4200"
        ));
        
        // Set allowed methods
        if (appConfig.getCors().getAllowedMethods() != null) {
            configuration.setAllowedMethods(Arrays.asList(appConfig.getCors().getAllowedMethods()));
        } else {
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        }
        
        // Set allowed headers
        if (appConfig.getCors().getAllowedHeaders() != null) {
            configuration.setAllowedHeaders(Arrays.asList(appConfig.getCors().getAllowedHeaders()));
        } else {
            configuration.setAllowedHeaders(Arrays.asList("*"));
        }
        
        // Allow credentials
        configuration.setAllowCredentials(appConfig.getCors().isAllowCredentials());
        
        // Expose headers
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        // Max age
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
