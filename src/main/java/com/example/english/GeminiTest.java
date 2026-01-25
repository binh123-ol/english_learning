package com.example.english;

import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class GeminiTest {
    public static void main(String[] args) {
        String apiKey = "AIzaSyCiIB3oK8-N7PGgC73MboYZImeyDW3rb9M";
        WebClient client = WebClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();

        try {
            String response = client.get()
                    .uri("/v1beta/models?key=" + apiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            System.out.println("Available Gemini Models:");
            for (JsonNode model : root.path("models")) {
                System.out.println(
                        " - " + model.path("name").asText() + " (" + model.path("supportedGenerationMethods") + ")");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
