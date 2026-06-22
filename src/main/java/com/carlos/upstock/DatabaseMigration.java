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

            jdbcTemplate.update("UPDATE products SET user_id = 1 WHERE user_id IS NULL");
            jdbcTemplate.update("UPDATE movements SET user_id = 1 WHERE user_id IS NULL");

            try {
                jdbcTemplate.update("ALTER TABLE products ALTER COLUMN user_id SET NOT NULL");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.update("ALTER TABLE movements ALTER COLUMN user_id SET NOT NULL");
            } catch (Exception ignored) {}

            jdbcTemplate.update("ALTER TABLE movements DROP CONSTRAINT IF EXISTS movements_product_id_fkey");
            jdbcTemplate.update("ALTER TABLE movements ADD CONSTRAINT movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE");

            log.info("Database migration: user_id columns + CASCADE FK on movements");
        } catch (Exception e) {
            log.warn("Migration could not run: {}", e.getMessage());
        }
    }
}
