package com.subscript.sharing;

public enum Permission {
  VIEW_SUBSCRIPTIONS("view:subscriptions"),
  CREATE_SUBSCRIPTIONS("create:subscriptions"),
  UPDATE_SUBSCRIPTIONS("update:subscriptions"),
  DELETE_SUBSCRIPTIONS("delete:subscriptions"),
  VIEW_MEMBERS("view:members"),
  MANAGE_MEMBERS("manage:members");

  private final String value;

  Permission(String value) {
    this.value = value;
  }

  public String value() {
    return value;
  }
}
