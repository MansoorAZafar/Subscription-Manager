package com.subscript.sharing;

import com.subscript.config.SmpProperties;
import com.subscript.subscription.Subscription;
import com.subscript.subscription.SubscriptionRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HouseholdService {

  private static final SecureRandom RANDOM = new SecureRandom();
  private final HouseholdRepository households;
  private final HouseholdMemberRepository members;
  private final HouseholdInvitationRepository invitations;
  private final SubscriptionRepository subscriptions;
  private final SmpProperties properties;

  public HouseholdService(
    HouseholdRepository households,
    HouseholdMemberRepository members,
    HouseholdInvitationRepository invitations,
    SubscriptionRepository subscriptions,
    SmpProperties properties
  ) {
    this.households = households;
    this.members = members;
    this.invitations = invitations;
    this.subscriptions = subscriptions;
    this.properties = properties;
  }

  @Transactional
  public List<HouseholdSummary> listHouseholds(
    String userId,
    String email,
    String name
  ) {
    ensurePersonalHousehold(userId, email, name);
    return members
      .findByUserIdOrderByIdAsc(userId)
      .stream()
      .map(m ->
        new HouseholdSummary(
          m.getHousehold().getId(),
          m.getHousehold().getName(),
          m.getRole().name(),
          RolePermissions.forRole(m.getRole())
            .stream()
            .map(Permission::value)
            .sorted()
            .toList(),
          Math.toIntExact(members.countByHouseholdId(m.getHousehold().getId()))
        )
      )
      .toList();
  }

  @Transactional
  public HouseholdMember requireMembership(
    String userId,
    Long householdId,
    Permission permission
  ) {
    HouseholdMember member;
    if (householdId != null) {
      member = members
        .findByUserIdAndHouseholdId(userId, householdId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    } else {
      member = members
        .findFirstByUserIdAndRoleOrderByIdAsc(userId, Role.OWNER)
        .orElseGet(() ->
          members
            .findByUserIdOrderByIdAsc(userId)
            .stream()
            .findFirst()
            .orElseThrow(() ->
              new ResponseStatusException(HttpStatus.NOT_FOUND)
            )
        );
    }
    if (
      !RolePermissions.allows(member.getRole(), permission)
    ) throw new ResponseStatusException(
      HttpStatus.FORBIDDEN,
      "Missing permission: " + permission.value()
    );
    return member;
  }

  @Transactional(readOnly = true)
  public List<MemberView> listMembers(String userId, Long householdId) {
    HouseholdMember caller = requireMembership(
      userId,
      householdId,
      Permission.VIEW_MEMBERS
    );
    return members
      .findByHouseholdIdOrderByJoinedAtAsc(caller.getHousehold().getId())
      .stream()
      .map(HouseholdService::view)
      .toList();
  }

  @Transactional
  public InviteView invite(
    String inviterId,
    Long householdId,
    String email,
    Role role
  ) {
    HouseholdMember inviter = requireMembership(
      inviterId,
      householdId,
      Permission.MANAGE_MEMBERS
    );
    if (role == Role.OWNER) throw new ResponseStatusException(
      HttpStatus.BAD_REQUEST,
      "Owner access cannot be invited or assigned."
    );
    String normalizedEmail = email.trim().toLowerCase();
    if (
      members
        .findByHouseholdIdOrderByJoinedAtAsc(inviter.getHousehold().getId())
        .stream()
        .anyMatch(m -> normalizedEmail.equalsIgnoreCase(m.getEmail()))
    ) {
      throw new ResponseStatusException(
        HttpStatus.CONFLICT,
        "This email already belongs to the workspace."
      );
    }
    byte[] rawToken = new byte[32];
    RANDOM.nextBytes(rawToken);
    String token = Base64.getUrlEncoder()
      .withoutPadding()
      .encodeToString(rawToken);
    Instant expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
    invitations.save(
      new HouseholdInvitation(
        inviter.getHousehold(),
        normalizedEmail,
        role,
        sha256(token),
        inviterId,
        expiresAt
      )
    );
    String inviteUrl =
      properties.sharing().frontendOrigin().replaceAll("/$", "") +
      "/?invite=" +
      token;
    return new InviteView(inviteUrl, expiresAt);
  }

  @Transactional
  public HouseholdSummary acceptInvite(
    String userId,
    String email,
    boolean verified,
    String displayName,
    String token
  ) {
    if (
      !verified || email == null || email.isBlank()
    ) throw new ResponseStatusException(
      HttpStatus.FORBIDDEN,
      "A verified Auth0 email is required to accept an invitation."
    );
    HouseholdInvitation invitation = invitations
      .findByTokenHashAndAcceptedAtIsNullAndExpiresAtAfter(
        sha256(token),
        Instant.now()
      )
      .orElseThrow(() ->
        new ResponseStatusException(
          HttpStatus.GONE,
          "Invitation is invalid, expired, or already used."
        )
      );
    if (
      !invitation.getEmail().equalsIgnoreCase(email.trim())
    ) throw new ResponseStatusException(
      HttpStatus.FORBIDDEN,
      "Sign in with the email address that received the invitation."
    );
    Long householdId = invitation.getHousehold().getId();
    if (
      members.existsByUserIdAndHouseholdId(userId, householdId)
    ) throw new ResponseStatusException(
      HttpStatus.CONFLICT,
      "You are already a household member."
    );
    members.save(
      new HouseholdMember(
        invitation.getHousehold(),
        userId,
        email.trim().toLowerCase(),
        displayName,
        invitation.getRole()
      )
    );
    invitation.setAcceptedAt(Instant.now());
    invitations.save(invitation);
    Household household = invitation.getHousehold();
    return new HouseholdSummary(
      household.getId(),
      household.getName(),
      invitation.getRole().name(),
      RolePermissions.forRole(invitation.getRole())
        .stream()
        .map(Permission::value)
        .sorted()
        .toList(),
      members.findByHouseholdIdOrderByJoinedAtAsc(householdId).size()
    );
  }

  @Transactional
  public MemberView updateRole(
    String callerId,
    Long householdId,
    Long memberId,
    Role role
  ) {
    HouseholdMember caller = requireMembership(
      callerId,
      householdId,
      Permission.MANAGE_MEMBERS
    );
    HouseholdMember target = members
      .findById(memberId)
      .filter(m ->
        m.getHousehold().getId().equals(caller.getHousehold().getId())
      )
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (
      target.getRole() == Role.OWNER || role == Role.OWNER
    ) throw new ResponseStatusException(
      HttpStatus.BAD_REQUEST,
      "Owner access cannot be changed here."
    );
    target.setRole(role);
    return view(members.save(target));
  }

  @Transactional
  public void removeMember(String callerId, Long householdId, Long memberId) {
    HouseholdMember caller = requireMembership(
      callerId,
      householdId,
      Permission.MANAGE_MEMBERS
    );
    HouseholdMember target = members
      .findById(memberId)
      .filter(m ->
        m.getHousehold().getId().equals(caller.getHousehold().getId())
      )
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (target.getRole() == Role.OWNER) throw new ResponseStatusException(
      HttpStatus.BAD_REQUEST,
      "The household owner cannot be removed."
    );
    members.delete(target);
  }

  private void ensurePersonalHousehold(
    String userId,
    String email,
    String displayName
  ) {
    var existingOwner = members.findFirstByUserIdAndRoleOrderByIdAsc(
      userId,
      Role.OWNER
    );
    if (existingOwner.isPresent()) {
      attachLegacySubscriptions(userId, existingOwner.get().getHousehold());
      return;
    }
    String safeName =
      displayName == null || displayName.isBlank()
        ? "My household"
        : displayName.trim() + "'s household";
    Household household = households.save(new Household(safeName, userId));
    members.save(
      new HouseholdMember(household, userId, email, displayName, Role.OWNER)
    );
    attachLegacySubscriptions(userId, household);
  }

  private void attachLegacySubscriptions(String userId, Household household) {
    for (Subscription legacy : subscriptions.findByOwnerIdAndHouseholdIsNull(
      userId
    )) {
      legacy.setHousehold(household);
      subscriptions.save(legacy);
    }
  }

  private static MemberView view(HouseholdMember m) {
    return new MemberView(
      m.getId(),
      m.getEmail(),
      m.getDisplayName(),
      m.getRole().name(),
      m.getJoinedAt()
    );
  }

  private static String sha256(String value) {
    try {
      return HexFormat.of().formatHex(
        MessageDigest.getInstance("SHA-256").digest(
          value.getBytes(StandardCharsets.UTF_8)
        )
      );
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 is unavailable", e);
    }
  }

  public record HouseholdSummary(
    Long id,
    String name,
    String role,
    List<String> permissions,
    int memberCount
  ) {}

  public record MemberView(
    Long id,
    String email,
    String name,
    String role,
    Instant joinedAt
  ) {}

  public record InviteView(String inviteUrl, Instant expiresAt) {}
}
