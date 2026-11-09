package com.subscript.sharing;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "households")
public class Household {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(name = "created_by_user_id", nullable = false, length = 180)
  private String createdByUserId;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  protected Household() {}

  public Household(String name, String createdByUserId) {
    this.name = name;
    this.createdByUserId = createdByUserId;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getCreatedByUserId() {
    return createdByUserId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
