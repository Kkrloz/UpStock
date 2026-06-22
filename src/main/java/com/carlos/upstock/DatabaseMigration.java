package com.carlos.upstock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
class DatabaseMigration implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigration.class);
    private final JdbcTemplate jdbcTemplate;

    DatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.update("ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id BIGINT NOT NULL DEFAULT 1");
            jdbcTemplate.update("ALTER TABLE movements ADD COLUMN IF NOT EXISTS user_id BIGINT NOT NULL DEFAULT 1");
            log.info("Database migration: added user_id columns to products and movements");
        } catch (Exception e) {
            log.warn("Migration could not run: {}", e.getMessage());
        }
    }
}
