# Codex project guidance

## Project layout
- `smp-frontend/`: Vite, React, Material UI, Auth0 React SDK, Recharts.
- `smp-backend/`: Spring Boot, PostgreSQL, Auth0 JWT resource server, one-time workspace invitations.

## Working rules
- Keep frontend API calls under `/api`; never put secrets in `VITE_*` variables.
- Scope every subscription read or mutation to the authenticated Auth0 `sub` claim.
- Scope shared subscription actions to a household membership and resolve roles through the centralized `RolePermissions` permission catalog. Never authorize from frontend visibility alone.
- Keep invitation tokens one-time, short-lived, hashed at rest, and bound to the verified invite email.
- Treat Auth0 subject IDs as identifiers, never as email addresses. Bind invitation acceptance to the verified invite email.
- Read local `.env.example` files for available settings; do not commit real credentials.
