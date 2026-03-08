package com.rentaltracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Called by the frontend after Google OAuth via Supabase to register/sync the user.
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sync(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("TODO");
    }
}
