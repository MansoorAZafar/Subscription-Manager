package com.subscript.subscription;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class PageResponseTest {

  @Test
  void mapsContentAndPreservesPageMetadata() {
    var page = new PageImpl<>(List.of("one", "two"), PageRequest.of(1, 2), 5);

    PageResponse<Integer> response = PageResponse.from(page, String::length);

    assertEquals(List.of(3, 3), response.content());
    assertEquals(1, response.number());
    assertEquals(2, response.size());
    assertEquals(5, response.totalElements());
    assertEquals(3, response.totalPages());
  }
}
