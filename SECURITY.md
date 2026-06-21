# Security Policy

## Supported Versions

InkFlow Theme is a static front-end template. Security fixes are applied to the
latest released version. Older versions are not maintained.

| Version | Supported |
| ------- | --------- |
| Latest `3.x` | ✅ |
| < latest | ❌ |

## Reporting a Vulnerability

If you discover a security issue, please **do not open a public issue**.

Instead, report it privately via GitHub's
[security advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
("Report a vulnerability" in the repository's **Security** tab), or contact the
maintainer directly.

Please include:

- A description of the issue and its potential impact.
- Steps to reproduce, or a proof of concept.
- Affected version(s) and environment.

You can expect an initial acknowledgement within a few business days.

## Scope and Boundaries

This project ships front-end templates only. The demo authentication, comments,
subscription, reactions and profile features are **UI demonstrations** backed by
`localStorage`, not real services — see [`docs/integration.md`](docs/integration.md).
They must be replaced with server-backed implementations (auth, CSRF protection,
rate limiting, input validation) before production use.

When integrating:

- Never treat the demo `localStorage` auth state as a security boundary.
- Add authentication and access control to any network-exposed endpoints you build.
- Keep `npm audit --audit-level=moderate` clean as part of your release process.
