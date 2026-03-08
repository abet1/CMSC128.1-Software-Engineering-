package com.rentaltracker.security;

/**
 * Represents the authenticated user extracted from the Supabase JWT.
 * The {@code userId} corresponds to the {@code sub} claim in the JWT.
 */
public record UserPrincipal(String userId) {
}
