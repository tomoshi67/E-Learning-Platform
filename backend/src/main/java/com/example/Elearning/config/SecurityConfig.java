package com.example.Elearning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.Elearning.security.JwtFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {

        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:5173"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                )
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/auth/register", "/auth/login", "/hello").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // WebSocket handshake: JWT is validated separately at the STOMP CONNECT
                        // frame level (see StompAuthChannelInterceptor), not via this HTTP filter.
                        .requestMatchers("/ws-chat/**").permitAll()

                        .requestMatchers("/payments/**").hasRole("USER")

                        .requestMatchers("/enrollments/enroll").hasRole("USER")
                        .requestMatchers("/enrollments/user/**").hasRole("USER")
                        .requestMatchers("/progress/update").hasRole("USER")
                        .requestMatchers("/progress/user/**").hasRole("USER")
                        .requestMatchers("/reviews/add").hasRole("USER")


                        .requestMatchers("/courses/add").hasRole("INSTRUCTOR")
                        .requestMatchers("/courses/update/**").hasRole("INSTRUCTOR")
                        .requestMatchers("/courses/delete/**").hasRole("INSTRUCTOR")

                        .requestMatchers("/courses/recommendations/**").hasRole("USER")

                        .requestMatchers("/lectures/upload/**").hasRole("INSTRUCTOR")
                        .requestMatchers("/lectures/delete/**").hasRole("INSTRUCTOR")
                        .requestMatchers("/lectures/update-order/**").hasRole("INSTRUCTOR")

                        .requestMatchers("/quizzes/generate-ai").hasRole("INSTRUCTOR")
                        .requestMatchers("/quiz-questions/add-bulk").hasRole("INSTRUCTOR")


                        .requestMatchers("/admin/**").hasRole("ADMIN")


                        .requestMatchers("/courses/all")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/lectures/course/**")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/lectures/summarize/**")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/reviews/course/**")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/quizzes/course/**")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/quiz-questions/**")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/quiz-attempts/**")
                        .hasRole("USER")

                        .requestMatchers("/notifications/**")
                        .hasAnyRole("USER", "INSTRUCTOR")

                        .requestMatchers("/chat/**")
                        .hasAnyRole("USER", "INSTRUCTOR")

                        .requestMatchers("/doubts/**")
                        .hasRole("USER")

                        .requestMatchers("/auth/profile/update")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/auth/profile/**")
                        .hasAnyRole("USER", "INSTRUCTOR", "ADMIN")

                        .requestMatchers("/enrollments/course/**")
                        .hasAnyRole("USER","INSTRUCTOR", "ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}