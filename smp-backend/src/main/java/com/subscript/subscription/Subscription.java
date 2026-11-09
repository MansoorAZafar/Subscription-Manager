package com.subscript.subscription;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.subscript.sharing.Household;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
  name = "subscriptions",
  indexes = @Index(name = "idx_subscription_owner", columnList = "owner_id")
)
public class Subscription {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "household_id")
  private Household household;

  @JsonIgnore
  @Column(name = "owner_id", nullable = false, length = 180)
  private String ownerId;

  @NotBlank
  @Column(nullable = false)
  private String name;

  private String plan;

  @NotBlank
  @Column(nullable = false)
  private String category;

  @NotNull
  @DecimalMin("0.01")
  @Digits(integer = 8, fraction = 2)
  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal price;

  @NotBlank
  @Column(nullable = false)
  private String cycle;

  @NotNull
  @Column(name = "next_payment_date", nullable = false)
  private LocalDate nextPaymentDate;

  @Column(nullable = false)
  private boolean active = true;

  protected Subscription() {}

  public Long getId() {
    return id;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public Household getHousehold() {
    return household;
  }

  public void setHousehold(Household household) {
    this.household = household;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPlan() {
    return plan;
  }

  public void setPlan(String plan) {
    this.plan = plan;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public String getCycle() {
    return cycle;
  }

  public void setCycle(String cycle) {
    this.cycle = cycle;
  }

  public LocalDate getNextPaymentDate() {
    return nextPaymentDate;
  }

  public void setNextPaymentDate(LocalDate nextPaymentDate) {
    this.nextPaymentDate = nextPaymentDate;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
