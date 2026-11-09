package com.subscript.analytics;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

  private final AnalyticsService analytics;

  public AnalyticsController(AnalyticsService analytics) {
    this.analytics = analytics;
  }

  @GetMapping("/summary")
  public AnalyticsService.Summary summary(
    @AuthenticationPrincipal Jwt jwt,
    @RequestParam(required = false) Long householdId
  ) {
    return analytics.summary(jwt.getSubject(), householdId);
  }
}
