package com.arkive.backend.util;

import com.arkive.backend.config.AppCorsProperties;
import com.arkive.backend.services.JwtService;
import com.arkive.backend.services.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
public class SecurityConfi {
    
    @Bean
    public PasswordEncoder encoder(){
        return new BCryptPasswordEncoder(16);
    }

    @Bean
    public JwtCookieAuthFilter jwtCookieAuthFilter(JwtService jwtService, UserService userService) {
        return new JwtCookieAuthFilter(jwtService, userService);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AppCorsProperties corsProperties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.getAllowedOrigins());
        configuration.setAllowedMethods(corsProperties.getAllowedMethods());
        configuration.setAllowedHeaders(corsProperties.getAllowedHeaders());
        configuration.setAllowCredentials(corsProperties.isAllowCredentials());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtCookieAuthFilter jwtCookieAuthFilter,
            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http.authorizeHttpRequests(auth -> auth.requestMatchers("/api/auth/**").permitAll()
                                    .anyRequest().authenticated())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtCookieAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

}
