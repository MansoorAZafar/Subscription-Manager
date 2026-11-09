package com.subscript.sharing;

import com.subscript.config.Auth0Identity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HouseholdController {

  private final HouseholdService service;
  private final Auth0Identity identity;

  public HouseholdController(HouseholdService service, Auth0Identity identity) {
    this.service = service;
    this.identity = identity;
  }

  @GetMapping("/households")
  public List<HouseholdService.HouseholdSummary> households(
    @AuthenticationPrincipal Jwt jwt
  ) {
    return service.listHouseholds(
      jwt.getSubject(),
      identity.verifiedEmail(jwt),
      jwt.getClaimAsString("name")
    );
  }

  @GetMapping("/households/{householdId}/members")
  public List<HouseholdService.MemberView> members(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable Long householdId
  ) {
    return service.listMembers(jwt.getSubject(), householdId);
  }

  @PostMapping("/households/{householdId}/invitations")
  @ResponseStatus(HttpStatus.CREATED)
  public HouseholdService.InviteView invite(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable Long householdId,
    @Valid @RequestBody InviteRequest request
  ) {
    return service.invite(
      jwt.getSubject(),
      householdId,
      request.email(),
      request.role()
    );
  }

  @PostMapping("/household-invitations/accept")
  public HouseholdService.HouseholdSummary accept(
    @AuthenticationPrincipal Jwt jwt,
    @Valid @RequestBody AcceptRequest request
  ) {
    String email = identity.verifiedEmail(jwt);
    return service.acceptInvite(
      jwt.getSubject(),
      email,
      email != null,
      jwt.getClaimAsString("name"),
      request.token()
    );
  }

  @PutMapping("/households/{householdId}/members/{memberId}/role")
  public HouseholdService.MemberView updateRole(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable Long householdId,
    @PathVariable Long memberId,
    @Valid @RequestBody RoleRequest request
  ) {
    return service.updateRole(
      jwt.getSubject(),
      householdId,
      memberId,
      request.role()
    );
  }

  @DeleteMapping("/households/{householdId}/members/{memberId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void remove(
    @AuthenticationPrincipal Jwt jwt,
    @PathVariable Long householdId,
    @PathVariable Long memberId
  ) {
    service.removeMember(jwt.getSubject(), householdId, memberId);
  }

  public record InviteRequest(
    @NotBlank @Email String email,
    @NotNull Role role
  ) {}

  public record AcceptRequest(@NotBlank String token) {}

  public record RoleRequest(@NotNull Role role) {}
}
