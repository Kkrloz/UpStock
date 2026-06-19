package com.carlos.upstock;

import com.carlos.upstock.user.UserModel;
import com.carlos.upstock.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class UpstockApplication {

	public static void main(String[] args) {
		SpringApplication.run(UpstockApplication.class, args);
	}

	@Bean
	CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			var adminOpt = userRepository.findByEmail("admin@upstock.com");
			if (adminOpt.isEmpty()) {
				UserModel admin = new UserModel();
				admin.setName("Admin");
				admin.setEmail("admin@upstock.com");
				admin.setPassword(passwordEncoder.encode("CHANGE_ME"));
				admin.setCargo("Administrador");
				admin.setRole("ADMIN");
				userRepository.save(admin);
				System.out.println("Default admin created: admin@upstock.com / CHANGE_ME");
			} else {
				UserModel admin = adminOpt.get();
				boolean changed = false;
				if (!"ADMIN".equals(admin.getRole())) {
					admin.setRole("ADMIN");
					changed = true;
				}
				if (admin.getCargo() == null) {
					admin.setCargo("Administrador");
					changed = true;
				}
				if (changed) {
					userRepository.save(admin);
					System.out.println("Admin user updated with ADMIN role and cargo");
				}
			}
		};
	}
}
