package com.subscript.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(
    ApiExceptionHandler.class
  );

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ProblemDetail> handleResponseStatus(
    ResponseStatusException exception
  ) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
      exception.getStatusCode(),
      exception.getReason() == null
        ? "The request could not be completed."
        : exception.getReason()
    );
    problem.setTitle(
      HttpStatus.valueOf(exception.getStatusCode().value()).getReasonPhrase()
    );
    return ResponseEntity.status(exception.getStatusCode()).body(problem);
  }

  @ExceptionHandler({
    MethodArgumentNotValidException.class,
    HandlerMethodValidationException.class,
    HttpMessageNotReadableException.class,
  })
  public ResponseEntity<ProblemDetail> handleBadRequest(Exception exception) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
      HttpStatus.BAD_REQUEST,
      "The request contains invalid or incomplete data."
    );
    problem.setTitle("Bad request");
    return ResponseEntity.badRequest().body(problem);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ProblemDetail> handleUnexpected(Exception exception) {
    log.error("Unhandled request failure", exception);
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "The request could not be completed."
    );
    problem.setTitle("Internal server error");
    return ResponseEntity.internalServerError().body(problem);
  }
}
