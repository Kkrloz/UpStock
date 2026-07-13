package com.carlos.upstock;

import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@SpringBootApplication
@EnableScheduling
public class UpstockApplication {

	public static void main(String[] args) {
		SpringApplication.run(UpstockApplication.class, args);
	}

	@Value("${admin.password}")
	private String adminPassword;

	@Bean
	CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String adminEmail = "admin@upstock.com";

			var adminOpt = userRepository.findByEmail(adminEmail);
			if (adminOpt.isEmpty()) {
				UserModel admin = new UserModel();
				admin.setName("Admin");
				admin.setEmail(adminEmail);
				admin.setPassword(passwordEncoder.encode(adminPassword));
				admin.setCargo("Administrador");
				admin.setRole("ADMIN");
				userRepository.save(admin);
				log.info("Default admin created");
			} else {
				UserModel admin = adminOpt.get();
				admin.setPassword(passwordEncoder.encode(adminPassword));
				admin.setRole("ADMIN");
				if (admin.getCargo() == null) admin.setCargo("Administrador");
				userRepository.save(admin);
				log.info("Admin password updated via ADMIN_PASSWORD env var");
			}
		};
	}
}
