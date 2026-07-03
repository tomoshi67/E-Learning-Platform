package com.example.Elearning.config;

import com.example.Elearning.Role;
import com.example.Elearning.model.User;
import com.example.Elearning.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DefaultAdminConfig {

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        return args -> {
            String adminEmail = "tomoshi@gmail.com";

            User existingAdmin = userRepository.findByEmail(adminEmail);

            if (existingAdmin != null) {
                return;
            }

            User admin = new User();
            admin.setUsername("Tomoshi");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("fairy tail1234"));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
        };
    }
}