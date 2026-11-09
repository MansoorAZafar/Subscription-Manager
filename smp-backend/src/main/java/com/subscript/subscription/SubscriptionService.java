package com.subscript.subscription;

import com.subscript.sharing.HouseholdMember;
import com.subscript.sharing.HouseholdService;
import com.subscript.sharing.Permission;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SubscriptionService {

  private static final int MAX_PAGE_SIZE = 100;
  private final SubscriptionRepository subscriptions;
  private final HouseholdService households;

  public SubscriptionService(
    SubscriptionRepository subscriptions,
    HouseholdService households
  ) {
    this.subscriptions = subscriptions;
    this.households = households;
  }

  @Transactional(readOnly = true)
  public PageResponse<SubscriptionResponse> list(
    String userId,
    Long householdId,
    String search,
    String category,
    int page,
    int size
  ) {
    HouseholdMember member = households.requireMembership(
      userId,
      householdId,
      Permission.VIEW_SUBSCRIPTIONS
    );
    var result = subscriptions.searchByHousehold(
      member.getHousehold().getId(),
      search == null || search.isBlank() ? "" : search.trim(),
      category == null ||
        category.isBlank() ||
        category.equals("All subscriptions")
        ? ""
        : category,
      PageRequest.of(
        page,
        Math.min(size, MAX_PAGE_SIZE),
        Sort.by(Sort.Order.asc("nextPaymentDate"), Sort.Order.asc("id"))
      )
    );
    return PageResponse.from(result, SubscriptionResponse::from);
  }

  @Transactional(readOnly = true)
  public java.util.List<String> categories(String userId, Long householdId) {
    HouseholdMember member = households.requireMembership(
      userId,
      householdId,
      Permission.VIEW_SUBSCRIPTIONS
    );
    return subscriptions.findCategoriesByHousehold(
      member.getHousehold().getId()
    );
  }

  @Transactional
  public SubscriptionResponse create(
    String userId,
    Long householdId,
    SubscriptionRequest request
  ) {
    HouseholdMember member = households.requireMembership(
      userId,
      householdId,
      Permission.CREATE_SUBSCRIPTIONS
    );
    Subscription subscription = new Subscription();
    subscription.setOwnerId(userId);
    subscription.setHousehold(member.getHousehold());
    apply(subscription, request);
    return SubscriptionResponse.from(subscriptions.save(subscription));
  }

  @Transactional
  public SubscriptionResponse update(
    String userId,
    Long id,
    SubscriptionRequest request
  ) {
    Subscription subscription = findInHousehold(
      userId,
      id,
      Permission.UPDATE_SUBSCRIPTIONS
    );
    apply(subscription, request);
    return SubscriptionResponse.from(subscriptions.save(subscription));
  }

  @Transactional
  public void delete(String userId, Long id) {
    subscriptions.delete(
      findInHousehold(userId, id, Permission.DELETE_SUBSCRIPTIONS)
    );
  }

  private Subscription findInHousehold(
    String userId,
    Long id,
    Permission permission
  ) {
    Subscription subscription = subscriptions
      .findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (subscription.getHousehold() == null) throw new ResponseStatusException(
      HttpStatus.NOT_FOUND
    );
    households.requireMembership(
      userId,
      subscription.getHousehold().getId(),
      permission
    );
    return subscription;
  }

  private static void apply(Subscription target, SubscriptionRequest request) {
    target.setName(request.name().trim());
    target.setPlan(request.plan());
    target.setCategory(request.category().trim());
    target.setPrice(request.price());
    target.setCycle(request.cycle());
    target.setNextPaymentDate(request.nextPaymentDate());
    target.setActive(request.active() == null || request.active());
  }
}
