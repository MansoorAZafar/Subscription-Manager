package com.subscript.config;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class Auth0Identity {

  private final SmpProperties properties;

  public Auth0Identity(SmpProperties properties) {
    this.properties = properties;
  }

  public String verifiedEmail(Jwt jwt) {
    return Boolean.TRUE.equals(
      jwt.getClaim(properties.auth0().emailVerifiedClaim())
    )
      ? jwt.getClaimAsString(properties.auth0().emailClaim())
      : null;
  }
}
