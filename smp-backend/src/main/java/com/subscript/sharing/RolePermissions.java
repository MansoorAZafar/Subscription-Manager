package com.subscript.sharing;

import java.util.Map;
import java.util.Set;

/** One source of truth for role-to-permission policy. Resource access is then scoped by household membership. */
public final class RolePermissions {

  private static final Map<Role, Set<Permission>> POLICY = Map.of(
    Role.OWNER,
    Set.of(
      Permission.VIEW_SUBSCRIPTIONS,
      Permission.CREATE_SUBSCRIPTIONS,
      Permission.UPDATE_SUBSCRIPTIONS,
      Permission.DELETE_SUBSCRIPTIONS,
      Permission.VIEW_MEMBERS,
      Permission.MANAGE_MEMBERS
    ),
    Role.EDITOR,
    Set.of(
      Permission.VIEW_SUBSCRIPTIONS,
      Permission.CREATE_SUBSCRIPTIONS,
      Permission.UPDATE_SUBSCRIPTIONS,
      Permission.DELETE_SUBSCRIPTIONS,
      Permission.VIEW_MEMBERS
    ),
    Role.VIEWER,
    Set.of(Permission.VIEW_SUBSCRIPTIONS, Permission.VIEW_MEMBERS)
  );

  private RolePermissions() {}

  public static Set<Permission> forRole(Role role) {
    return POLICY.getOrDefault(role, Set.of());
  }

  public static boolean allows(Role role, Permission permission) {
    return forRole(role).contains(permission);
  }
}
