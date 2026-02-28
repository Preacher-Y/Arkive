package com.arkive.backend.controller;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.arkive.backend.DTOs.user.*;
import com.arkive.backend.config.AuthCookieProperties;
import com.arkive.backend.services.AuthService;
import com.arkive.backend.services.JwtService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.persistence.EntityNotFoundException;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthCookieProperties authCookieProperties;

    public AuthController(AuthService authService, JwtService jwtService, AuthCookieProperties authCookieProperties) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authCookieProperties = authCookieProperties;
    }

    @PostMapping(value="/login", consumes=MediaType.APPLICATION_JSON_VALUE, produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDTO body, HttpServletResponse res){
        try{
            UserDTO user = authService.login(body);

            String accessToken = jwtService.generateToken(user.id(), user.email());

            ResponseCookie.ResponseCookieBuilder accessCookieBuilder = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, accessToken)
                                            .httpOnly(true)
                                            .secure(authCookieProperties.isSecure())
                                            .sameSite(authCookieProperties.getSameSite())
                                            .path("/")
                                            .maxAge(Duration.ofSeconds(authCookieProperties.getMaxAgeSeconds()));

            String cookieDomain = authCookieProperties.getDomain();
            if (cookieDomain != null && !cookieDomain.isBlank()) {
                accessCookieBuilder.domain(cookieDomain);
            }

            ResponseCookie accessCookie = accessCookieBuilder.build();

            res.addHeader("Set-Cookie",accessCookie.toString());
            
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch(EntityNotFoundException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }catch(Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping(value="/register", consumes=MediaType.APPLICATION_JSON_VALUE, produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody UserSignUpDTO body){
        String res = authService.register(body);

        if(res.equals("Added the user Successfully")){
            return new ResponseEntity<>(res, HttpStatus.CREATED);
        }

        return new ResponseEntity<>(res, HttpStatus.BAD_REQUEST);
    }
}
