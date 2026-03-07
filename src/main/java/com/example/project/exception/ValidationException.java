package com.example.project.exception;

/**
 * Exception thrown when validation fails
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}

