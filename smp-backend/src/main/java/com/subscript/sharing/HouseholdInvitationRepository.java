package com.subscript.sharing;

import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdInvitationRepository
  extends JpaRepository<HouseholdInvitation, Long>
{
  Optional<HouseholdInvitation> findByTokenHashAndAcceptedAtIsNullAndExpiresAtAfter(
    String tokenHash,
    Instant now
  );
}
