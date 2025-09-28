package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Must be at least 32 characters for HS256
    private static final String SECRET_KEY = "AnkitAnkitAnkitAnkitAnkitAnkitAnkit12";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    private final Key key;

    public JwtUtil() {
        this.key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Generate token with email + role (role stored WITHOUT ROLE_ prefix)
    public String generateToken(String email, String role) {
        String rawRole = role.startsWith("ROLE_") ? role.substring(5) : role; // remove prefix if present

        return Jwts.builder()
                .setSubject(email)
                .claim("role", rawRole) // store ADMIN, STUDENT, WARDEN only
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract username (email)
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    // Extract role (always returns raw form: ADMIN, STUDENT, WARDEN)
    public String extractRole(String token) {
        Object r = parseClaims(token).get("role");
        return r != null ? r.toString() : null;
    }

    // Validate only subject + expiration
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username != null
                    && username.equals(userDetails.getUsername())
                    && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        Date expiration = parseClaims(token).getExpiration();
        return expiration.before(new Date());
    }
}