# Frontend architecture notes

- Keep domain state and API access in `src/app` and `src/api`; build UI in feature folders and reusable components.
- Keep access tokens in the Auth0 SDK flow and pass them through the API client. Never put secrets in `VITE_*` variables.
- Use the backend's permission list for UI affordances, while treating backend authorization as the enforcement boundary.
- Keep collection views server-paginated and filters/search debounced. Lazy-load heavy analytics features.
- Prefer data-driven components over hardcoded categories and sample analytics. Demo data is only for unauthenticated portfolio preview.
