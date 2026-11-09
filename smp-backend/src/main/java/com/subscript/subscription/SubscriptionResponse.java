package com.subscript.subscription;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionResponse(
  Long id,
  String name,
  String plan,
  String category,
  BigDecimal price,
  String cycle,
  LocalDate nextPaymentDate,
  boolean active
) {
  public static SubscriptionResponse from(Subscription subscription) {
    return new SubscriptionResponse(
      subscription.getId(),
      subscription.getName(),
      subscription.getPlan(),
      subscription.getCategory(),
      subscription.getPrice(),
      subscription.getCycle(),
      subscription.getNextPaymentDate(),
      subscription.isActive()
    );
  }
}
