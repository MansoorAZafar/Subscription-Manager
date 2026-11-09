# Backend architecture notes

- Organize code by feature and keep controllers thin; validate request DTOs and return response DTOs rather than JPA entities.
- Put transactions and authorization in services. Resolve household capabilities through `RolePermissions`; scope every query to a household membership.
- Use pageable repository methods with explicit limits for collection endpoints and avoid loading full tables into memory.
- Keep settings in validated `@ConfigurationProperties`. Use `local` for ephemeral H2 PostgreSQL compatibility mode and `neon` for PostgreSQL/Flyway.
- Neon application traffic uses a pooled JDBC URL; Flyway uses a separate direct JDBC URL. Never commit credentials.
- Add schema changes as Flyway migrations.
