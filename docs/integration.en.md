# Production Integration Notes

InkFlow Theme is a static frontend theme template. The generated `dist/` output can be deployed directly to static hosting, but interactions such as login, comments, newsletter subscription, likes, bookmarks, and profile settings are demo UI flows by default. They are not a complete backend business system.

## Static-Ready Parts

- Page structure and responsive styling for home, post, archive, category, tag, album, links, login, and profile pages.
- Bootstrap 5.3.8 based layout, components, dark mode, navigation, search overlay, album lightbox, code copy, table of contents, and other frontend interactions.
- Vite output with relative paths, suitable for GitHub Pages, Vercel, Netlify, object storage, or CDN-based static hosting.

## Production Integration Required

For commercial production use, replace these demo flows with real business capabilities:

- Login, registration, password reset, and social login: integrate server-side authentication, sessions, JWT/OAuth, authorization checks, and logout.
- Comments, replies, likes, bookmarks, and post interactions: integrate backend APIs with authentication, moderation, anti-spam, rate limiting, and error handling.
- Newsletter, contact, and link application forms: integrate email or business APIs with CSRF protection, captcha, or frequency limits.
- Search: generate a real search index from your CMS/static site generator, or integrate a server-side/third-party search service.
- Profile, security, and notification settings: integrate an account system, step-up verification for sensitive actions, and server-side persistence.
- Posts, categories, tags, archives, and album data: integrate a CMS, static site generator, or backend data source instead of maintaining duplicated HTML manually.

## Auth Demo Boundary

The current frontend auth state stores `inkflow-user` in `localStorage` only to demonstrate navbar login state and profile entry behavior. It does not provide real security and must not replace server-side authentication. In production, remove or adapt this logic so auth state is driven by server sessions, HTTP-only cookies, JWT, or OAuth flows.

## Recommended Integration Pattern

1. Use a CMS or static site generator to produce post, category, tag, archive, and album pages.
2. Provide stable APIs for comments, newsletter subscriptions, link applications, profile updates, and similar actions with a consistent error format.
3. Wrap form submissions in reusable API adapters so UI components stay decoupled from backend implementation details.
4. Handle authentication, authorization, CSRF, rate limiting, logging, auditing, and sensitive data validation on the server.
5. Keep `npm run check`, `npm run smoke`, and `npm audit --audit-level=moderate` as release gates before deployment.

## Pre-Release Checks

```bash
npm run check
npm run smoke
npm audit --audit-level=moderate
npm run release
```

