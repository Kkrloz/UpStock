package com.carlos.upstock.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class LoginRateLimiter {

    private final Map<String, int[]> attempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 60_000L;

    public boolean isBlocked(HttpServletRequest request) {
        String key = getClientIp(request);
        int[] record = attempts.computeIfAbsent(key, k -> new int[]{0, 0});

        long now = System.currentTimeMillis();
        if (now - record[1] > WINDOW_MS) {
            record[0] = 0;
            record[1] = (int) (now / 1000);
        }

        return record[0] >= MAX_ATTEMPTS;
    }

    public void recordAttempt(HttpServletRequest request) {
        String key = getClientIp(request);
        int[] record = attempts.computeIfAbsent(key, k -> new int[]{0, (int) (System.currentTimeMillis() / 1000)});

        long now = System.currentTimeMillis();
        if (now - record[1] * 1000L > WINDOW_MS) {
            record[0] = 0;
            record[1] = (int) (now / 1000);
        }

        record[0]++;

        if (record[0] >= MAX_ATTEMPTS) {
            log.warn("Login rate limit reached for IP: {}", key);
        }
    }

    public void reset(String email) {
        attempts.remove(email);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
