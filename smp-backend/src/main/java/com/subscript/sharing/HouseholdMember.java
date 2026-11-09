package com.subscript.sharing;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
  name = "household_members",
  uniqueConstraints = @UniqueConstraint(
    name = "uk_household_member",
    columnNames = { "household_id", "user_id" }
  )
)
public class HouseholdMember {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "household_id", nullable = false)
  private Household household;

  @Column(name = "user_id", nullable = false, length = 180)
  private String userId;

  @Column(length = 320)
  private String email;

  @Column(name = "display_name", length = 180)
  private String displayName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @Column(nullable = false)
  private Instant joinedAt = Instant.now();

  protected HouseholdMember() {}

  public HouseholdMember(
    Household household,
    String userId,
    String email,
    String displayName,
    Role role
  ) {
    this.household = household;
    this.userId = userId;
    this.email = email;
    this.displayName = displayName;
    this.role = role;
  }

  public Long getId() {
    return id;
  }

  public Household getHousehold() {
    return household;
  }

  public String getUserId() {
    return userId;
  }

  public String getEmail() {
    return email;
  }

  public String getDisplayName() {
    return displayName;
  }

  public Role getRole() {
    return role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public Instant getJoinedAt() {
    return joinedAt;
  }
}
