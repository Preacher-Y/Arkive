package com.arkive.backend.util;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.arkive.backend.DTOs.user.UserDTO;
import com.arkive.backend.services.JwtService;
import com.arkive.backend.services.UserService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtCookieAuthFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtCookieAuthFilter.class);
    private static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";

    private final JwtService jwtService;
    private final UserService userService;
    private final WebAuthenticationDetailsSource authenticationDetailsSource;

    public JwtCookieAuthFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.authenticationDetailsSource = new WebAuthenticationDetailsSource();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractCookieValue(request, ACCESS_TOKEN_COOKIE_NAME);
        if (token == null || token.isBlank()) {
            LOGGER.debug("No access token cookie found on request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        authenticate(request, token);
        filterChain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, String token) {
        try {
            Jws<Claims> jwt = jwtService.verify(token);
            Claims claims = jwt.getPayload();
            UUID userId = parseUserId(claims.getSubject());

            if (userId == null) {
                return;
            }

            UserDTO userDetails = userService.getUserById(userId);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    AuthorityUtils.NO_AUTHORITIES);

            authentication.setDetails(authenticationDetailsSource.buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
            LOGGER.debug("JWT cookie authentication failed for request {}: {}", request.getRequestURI(),
                    exception.getMessage());
        } catch (RuntimeException exception) {
            SecurityContextHolder.clearContext();
            LOGGER.warn("Failed to establish authentication from JWT cookie", exception);
        }
    }

    private UUID parseUserId(String subject) {
        if (subject == null || subject.isBlank()) {
            return null;
        }

        try {
            return UUID.fromString(subject);
        } catch (IllegalArgumentException exception) {
            LOGGER.debug("JWT subject is not a valid UUID: {}", subject);
            return null;
        }
    }

    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
