package com.carlos.upstock.keepalive;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class KeepAliveService {

    private final JdbcTemplate jdbcTemplate;

    public KeepAliveService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Scheduled(fixedRateString = "${keepalive.interval:600000}")
    public void pingDatabase() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.trace("Database keepalive ping succeeded");
        } catch (Exception e) {
            log.warn("Database keepalive ping failed: {}", e.getMessage());
        }
    }
}
