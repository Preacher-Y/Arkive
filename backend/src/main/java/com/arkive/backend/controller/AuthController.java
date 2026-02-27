package com.arkive.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import com.arkive.backend.DTOs.user.*;
import com.arkive.backend.services.AuthService;
import com.arkive.backend.services.JwtService;

import java.time.Duration;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private JwtService jwtService;

    @PostMapping(value="/login", consumes=MediaType.APPLICATION_JSON_VALUE, produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginUser(@RequestBody UserLoginDTO body, HttpServletResponse res){
        try{
            UserDTO user = authService.login(body);

            String accessToken = jwtService.generateToken(user.id(), user.email());

            ResponseCookie accessCookie = ResponseCookie.from("access_token",accessToken)
                                            .httpOnly(true)
                                            .secure(true)
                                            .sameSite("Lax")
                                            .path("/")
                                            .maxAge(Duration.ofMinutes(15))
                                            .build();
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
