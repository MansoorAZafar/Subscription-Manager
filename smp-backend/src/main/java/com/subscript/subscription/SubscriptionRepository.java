package com.subscript.subscription;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubscriptionRepository
  extends JpaRepository<Subscription, Long>
{
  List<Subscription> findByOwnerIdOrderByNextPaymentDateAsc(String ownerId);
  List<Subscription> findByHouseholdIdOrderByNextPaymentDateAsc(
    Long householdId
  );
  Page<Subscription> findByHouseholdId(Long householdId, Pageable pageable);
  Page<Subscription> findByHouseholdIdAndActiveTrueAndNextPaymentDateGreaterThanEqual(
    Long householdId,
    LocalDate from,
    Pageable pageable
  );

  @Query(
    """
    select s from Subscription s
    where s.household.id = :householdId
      and (:search = '' or lower(s.name) like lower(concat('%', :search, '%')) or lower(s.category) like lower(concat('%', :search, '%')))
      and (:category = '' or s.category = :category)
    """
  )
  Page<Subscription> searchByHousehold(
    @Param("householdId") Long householdId,
    @Param("search") String search,
    @Param("category") String category,
    Pageable pageable
  );

  @Query(
    "select distinct s.category from Subscription s where s.household.id = :householdId order by s.category"
  )
  List<String> findCategoriesByHousehold(
    @Param("householdId") Long householdId
  );

  @Query(
    value = "select coalesce(sum(case when lower(cycle) = 'yearly' then price / 12 else price end), 0) from subscriptions where household_id = :householdId and active = true",
    nativeQuery = true
  )
  BigDecimal sumMonthlyEquivalentByHousehold(
    @Param("householdId") Long householdId
  );

  long countByHouseholdIdAndActiveTrue(Long householdId);

  @Query(
    "select count(distinct s.category) from Subscription s where s.household.id = :householdId and s.active = true"
  )
  long countActiveCategoriesByHousehold(@Param("householdId") Long householdId);

  List<Subscription> findByOwnerIdAndHouseholdIsNull(String ownerId);
}
