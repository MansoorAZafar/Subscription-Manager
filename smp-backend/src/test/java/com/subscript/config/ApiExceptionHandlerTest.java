package com.subscript.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ApiExceptionHandlerTest {

  private final ApiExceptionHandler handler = new ApiExceptionHandler();

  @Test
  void returnsProblemDetailForExpectedHttpErrors() {
    var response = handler.handleResponseStatus(
      new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found")
    );

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Not Found", response.getBody().getTitle());
    assertEquals("Workspace not found", response.getBody().getDetail());
  }
}
