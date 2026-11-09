# Subscription Management Platform

Subscription Manager that allows users to  keep track of all their subscriptions in one place.

## Projects
- `smp-frontend`: React + Vite + JavaScript + Material UI + Recharts + Auth0 React SDK.
- `smp-backend`: Spring Boot REST API + PostgreSQL + Auth0 JWT validation + one-time workspace invitations and permission-scoped membership.

## Run locally
1. Copy `smp-frontend/.env.example` to `smp-frontend/.env` and fill in Auth0 tenant, client ID, and audience.
2. For local backend development, copy `smp-backend/.env.example` to `smp-backend/.env`. The default `local` profile uses an ephemeral H2 database in PostgreSQL compatibility mode; no database service is required.
3. In `smp-frontend`, run `npm install`, then `npm run dev`.
4. In `smp-backend`, run `mvn spring-boot:run` (Java 21 and Maven required). The backend imports `smp-backend/.env` whether the working directory is the repository root or `smp-backend`.
5. In the Auth0 API, set the identifier to `https://smp-api` and configure the SPA callback/logout/origin URLs for `http://localhost:5173`.

### Neon PostgreSQL

Set `spring.profiles.active=neon` in `smp-backend/.env` and configure `NEON_JDBC_URL`, `NEON_MIGRATION_JDBC_URL`, `NEON_DB_USERNAME`, and `NEON_DB_PASSWORD` from Neon’s connection details. Restart the backend after changing the profile, then confirm startup logs say `The following 1 profile is active: "neon"`. Use the **pooled** `-pooler` hostname for application traffic and the **direct** hostname for Flyway migrations. Both URLs must use TLS (`sslmode=require`). The Neon profile runs Flyway migrations and validates the mapped schema; the local profile uses H2 `ddl-auto=update`. Keep Neon credentials out of source control.

The public landing page is shown to signed-out visitors. After signing in, a new user gets an empty personal household dashboard; its creator is the household `OWNER` and admin, with permission to invite members and manage access. API CRUD endpoints are at `/api/subscriptions` and return DTOs with capped pagination. Configure Auth0 before using protected API requests. Household access is relationship-scoped: each subscription belongs to a household; household membership has an `OWNER`, `EDITOR`, or `VIEWER` role; the backend resolves each role through the centralized `RolePermissions` catalog before allowing actions. Editors manage subscriptions, and viewers have read-only access. Invitations expire after seven days, can be accepted once, and require the invitee to authenticate with the invited email.

Configure an Auth0 Post Login Action to add verified email claims to access tokens for the `https://smp-api` audience:

```js
exports.onExecutePostLogin = async (event, api) => {
  if (event.resource_server?.identifier !== 'https://smp-api') return
  const namespace = 'https://subscript.app'
  api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email)
  api.accessToken.setCustomClaim(`${namespace}/email_verified`, event.user.email_verified === true)
}
```

Keep `AUTH0_EMAIL_CLAIM` and `AUTH0_EMAIL_VERIFIED_CLAIM` aligned with those names. The claims bind invite acceptance to the verified invitee. Creating an invitation returns a secure, one-time link for the entered email address; the app stores only a hash of its random token, and the link expires after seven days. Share that link with the invitee manually. The invitation can only be accepted by signing in with the verified email address it was created for.

## Tests and CI

- Backend: `cd smp-backend && mvn verify` runs the JUnit suite and packages the Spring Boot application.
- Frontend: `cd smp-frontend && npm test` runs the Node test suite; `npm run build` creates the production bundle.
- GitHub Actions runs both projects' checks for pushes and relevant pull requests. Push a `bv*` tag (for example, `bv0.1.0`) to publish the backend image to Docker Hub. Configure the repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`; `RENDER_DEPLOY_HOOK` is optional.
- The published image uses the `neon` profile. Configure `NEON_JDBC_URL`, `NEON_MIGRATION_JDBC_URL`, `NEON_DB_USERNAME`, `NEON_DB_PASSWORD`, and the required Auth0 settings in the deployment environment.

