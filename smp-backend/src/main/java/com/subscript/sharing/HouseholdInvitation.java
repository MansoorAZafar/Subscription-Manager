package com.subscript.sharing;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
  name = "household_invitations",
  indexes = @Index(
    name = "idx_household_invite_hash",
    columnList = "token_hash",
    unique = true
  )
)
public class HouseholdInvitation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "household_id", nullable = false)
  private Household household;

  @Column(name = "email", nullable = false, length = 320)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @Column(name = "token_hash", nullable = false, length = 64, unique = true)
  private String tokenHash;

  @Column(name = "invited_by_user_id", nullable = false, length = 180)
  private String invitedByUserId;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "accepted_at")
  private Instant acceptedAt;

  protected HouseholdInvitation() {}

  public HouseholdInvitation(
    Household household,
    String email,
    Role role,
    String tokenHash,
    String invitedByUserId,
    Instant expiresAt
  ) {
    this.household = household;
    this.email = email;
    this.role = role;
    this.tokenHash = tokenHash;
    this.invitedByUserId = invitedByUserId;
    this.expiresAt = expiresAt;
  }

  public Long getId() {
    return id;
  }

  public Household getHousehold() {
    return household;
  }

  public String getEmail() {
    return email;
  }

  public Role getRole() {
    return role;
  }

  public String getTokenHash() {
    return tokenHash;
  }

  public String getInvitedByUserId() {
    return invitedByUserId;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public Instant getAcceptedAt() {
    return acceptedAt;
  }

  public void setAcceptedAt(Instant acceptedAt) {
    this.acceptedAt = acceptedAt;
  }
}
