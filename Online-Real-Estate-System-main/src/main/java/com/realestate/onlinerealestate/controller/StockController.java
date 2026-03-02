package com.realestate.onlinerealestate.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.util.HashMap;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/price")
    public ResponseEntity<?> getStockPrice(@RequestParam String symbol) {
        try {
            String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1d";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            headers.setAccept(Collections.singletonList(org.springframework.http.MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            // We just forward the JSON response from Yahoo Finance to the frontend
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch stock price for " + symbol);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
