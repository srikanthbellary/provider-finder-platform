package com.healthapp.mapservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for the map service application
 * Provides consistent error responses across all controllers
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Error response DTO for API error messages
     */
    public static class ErrorResponse {
        private LocalDateTime timestamp;
        private int status;
        private String error;
        private String message;
        private String path;
        private Map<String, String> details;
        
        public ErrorResponse(int status, String error, String message, String path) {
            this.timestamp = LocalDateTime.now();
            this.status = status;
            this.error = error;
            this.message = message;
            this.path = path;
        }
        
        public ErrorResponse(int status, String error, String message, String path, Map<String, String> details) {
            this(status, error, message, path);
            this.details = details;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public int getStatus() {
            return status;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }

        public String getPath() {
            return path;
        }

        public Map<String, String> getDetails() {
            return details;
        }
    }

    /**
     * Handle ResponseStatusException (typically thrown by controllers)
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex, 
            org.springframework.web.context.request.WebRequest request) {
        
        log.error("Response status exception: {}", ex.getMessage(), ex);
        
        ErrorResponse errorResponse = new ErrorResponse(
                ex.getStatus().value(),
                ex.getStatus().getReasonPhrase(),
                ex.getReason(),
                request.getDescription(false).replace("uri=", "")
        );
        
        return new ResponseEntity<>(errorResponse, ex.getStatus());
    }

    /**
     * Handle validation errors from @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            org.springframework.web.context.request.WebRequest request) {
        
        log.error("Validation exception: {}", ex.getMessage(), ex);
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                request.getDescription(false).replace("uri=", ""),
                errors
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle constraint violations from @Validated
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex,
            org.springframework.web.context.request.WebRequest request) {
        
        log.error("Constraint violation: {}", ex.getMessage(), ex);
        
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        violation -> violation.getMessage(),
                        (e1, e2) -> e1
                ));
        
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Constraint violation",
                request.getDescription(false).replace("uri=", ""),
                errors
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleAllUncaughtException(
            Exception ex,
            org.springframework.web.context.request.WebRequest request) {
        
        log.error("Uncaught exception: {}", ex.getMessage(), ex);
        
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "An unexpected error occurred",
                request.getDescription(false).replace("uri=", "")
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 