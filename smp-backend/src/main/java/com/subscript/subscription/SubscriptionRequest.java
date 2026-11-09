package com.subscript.subscription;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionRequest(
  @NotBlank String name,
  String plan,
  @NotBlank String category,
  @NotNull
  @DecimalMin("0.01")
  @Digits(integer = 8, fraction = 2)
  BigDecimal price,
  @NotBlank @Pattern(regexp = "Monthly|Yearly") String cycle,
  @NotNull LocalDate nextPaymentDate,
  Boolean active
) {}
