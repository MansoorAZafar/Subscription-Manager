package com.subscript.sharing;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdMemberRepository
  extends JpaRepository<HouseholdMember, Long>
{
  long countByHouseholdId(Long householdId);
  List<HouseholdMember> findByUserIdOrderByIdAsc(String userId);
  List<HouseholdMember> findByHouseholdIdOrderByJoinedAtAsc(Long householdId);
  Optional<HouseholdMember> findByUserIdAndHouseholdId(
    String userId,
    Long householdId
  );
  Optional<HouseholdMember> findFirstByUserIdAndRoleOrderByIdAsc(
    String userId,
    Role role
  );
  boolean existsByUserIdAndHouseholdId(String userId, Long householdId);
}
