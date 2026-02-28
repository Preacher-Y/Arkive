package com.arkive.backend.services;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private final SecretKey key;

    public JwtService(@Value("${app.jwt.secret}") String jwtSecret) {
        this.key = createSigningKey(jwtSecret);
    }

    public String generateToken(UUID id, String email){
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claim("email",email)
                .issuedAt(new Date())
                .expiration(Date.from(Instant.now().plusSeconds(900)))
                .signWith(key)
                .compact();
    }

    public Jws<Claims> verify(String token){
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
    }

    private SecretKey createSigningKey(String jwtSecret) {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("app.jwt.secret must be configured");
        }

        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 bytes for HS256");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
