package com.subscript.analytics;

import com.subscript.sharing.HouseholdService;
import com.subscript.sharing.Permission;
import com.subscript.subscription.SubscriptionRepository;
import com.subscript.subscription.SubscriptionResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

  private final SubscriptionRepository subscriptions;
  private final HouseholdService households;

  public AnalyticsService(
    SubscriptionRepository subscriptions,
    HouseholdService households
  ) {
    this.subscriptions = subscriptions;
    this.households = households;
  }

  @Transactional(readOnly = true)
  public Summary summary(String userId, Long householdId) {
    var membership = households.requireMembership(
      userId,
      householdId,
      Permission.VIEW_SUBSCRIPTIONS
    );
    Long id = membership.getHousehold().getId();
    BigDecimal monthly = subscriptions.sumMonthlyEquivalentByHousehold(id);
    if (monthly == null) monthly = BigDecimal.ZERO;
    monthly = monthly.setScale(2, RoundingMode.HALF_UP);
    var upcoming = subscriptions
      .findByHouseholdIdAndActiveTrueAndNextPaymentDateGreaterThanEqual(
        id,
        LocalDate.now(),
        PageRequest.of(
          0,
          3,
          Sort.by(Sort.Order.asc("nextPaymentDate"), Sort.Order.asc("id"))
        )
      )
      .getContent()
      .stream()
      .map(SubscriptionResponse::from)
      .toList();
    return new Summary(
      monthly,
      monthly
        .multiply(BigDecimal.valueOf(12))
        .setScale(2, RoundingMode.HALF_UP),
      subscriptions.countByHouseholdIdAndActiveTrue(id),
      subscriptions.countActiveCategoriesByHousehold(id),
      upcoming
    );
  }

  public record Summary(
    BigDecimal monthlySpend,
    BigDecimal yearlyForecast,
    long activeSubscriptions,
    long activeCategories,
    java.util.List<SubscriptionResponse> upcomingPayments
  ) {}
}
