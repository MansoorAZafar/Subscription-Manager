package com.subscript.sharing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import org.junit.jupiter.api.Test;

class RolePermissionsTest {

  @Test
  void ownerCanManageWorkspaceAndSubscriptions() {
    assertEquals(
      Set.of(Permission.values()),
      RolePermissions.forRole(Role.OWNER)
    );
  }

  @Test
  void editorCanChangeSubscriptionsButCannotManageMembers() {
    assertTrue(
      RolePermissions.allows(Role.EDITOR, Permission.UPDATE_SUBSCRIPTIONS)
    );
    assertFalse(RolePermissions.allows(Role.EDITOR, Permission.MANAGE_MEMBERS));
  }

  @Test
  void viewerCanReadButCannotChangeWorkspaceData() {
    assertTrue(
      RolePermissions.allows(Role.VIEWER, Permission.VIEW_SUBSCRIPTIONS)
    );
    assertTrue(RolePermissions.allows(Role.VIEWER, Permission.VIEW_MEMBERS));
    assertFalse(
      RolePermissions.allows(Role.VIEWER, Permission.CREATE_SUBSCRIPTIONS)
    );
    assertFalse(RolePermissions.allows(Role.VIEWER, Permission.MANAGE_MEMBERS));
  }
}
