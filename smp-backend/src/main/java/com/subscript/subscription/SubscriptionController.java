package com.subscript.subscription;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

  private final SubscriptionService subscriptions;

  public SubscriptionController(SubscriptionService subscriptions) {
    this.subscriptions = subscriptions;
  }

  @GetMapping
  public PageResponse<SubscriptionResponse> list(
    @AuthenticationPrincipal Jwt jwt,
    @RequestParam(required = false) Long householdId,
    @RequestParam(required = false) @Size(max = 80) String search,
    @RequestParam(required = false) @Size(max = 80) String category,
    @RequestParam(defaultValue = "0") @Min(0) int page,
    @RequestParam(defaultValue = "25") @Min(1) @Max(100) int size
  ) {
    return subscriptions.list(
      jwt.getSubject(),
      householdId,
      search,
      category,
      page,
      size
    );
  }

  @GetMapping("/categories")
  public java.util.List<String> categories(
    @AuthenticationPrincipal Jwt jwt,
    @RequestParam(required = false) Long householdId
  ) {
    return subscriptions.categories(jwt.getSubject(), householdId);
  }

  @PostMapping
  public ResponseEntity<SubscriptionResponse> create(
    @AuthenticationPrincipal Jwt jwt,
    @RequestParam(required = false) Long householdId,
    @Valid @RequestBody SubscriptionRequest request
  ) {
    SubscriptionResponse saved = subscriptions.create(
      jwt.getSubject(),
      householdId,
      request
    );
    return ResponseEntity.created(
      URI.create("/api/subscriptions/" + saved.id())
    ).body(saved);
  }

  @PutMapping("/{id}")
  public SubscriptionResponse update(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable Long id,
    @Valid @RequestBody SubscriptionRequest request
  ) {
    return subscriptions.update(jwt.getSubject(), id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
    subscriptions.delete(jwt.getSubject(), id);
  }
}
