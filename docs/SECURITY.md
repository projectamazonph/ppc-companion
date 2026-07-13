# Security

## Security posture

Security is part of design and delivery, not a final review. Apply controls proportionally to the project's data, exposure, and business impact.

## Baseline requirements

- Keep secrets outside source control and rotate exposed credentials immediately.
- Validate and normalize untrusted input at boundaries.
- Enforce authentication and authorization server-side.
- Use least-privilege service accounts, tokens, and database roles.
- Protect data in transit and at rest when sensitivity requires it.
- Avoid logging secrets, credentials, tokens, or unnecessary personal data.
- Pin and scan dependencies and review high-risk updates.
- Define rate limits, timeouts, retries, and abuse controls for exposed interfaces.

## Data classification

Current classification: Not yet classified. Before production use, document categories, owners, retention, deletion, backup, and access rules.

## Vulnerability handling

Report vulnerabilities privately to the repository owner or designated security contact. Do not include exploit details in public issues until remediation is available.

## Release review

Review authentication, authorization, input handling, dependency risk, secret exposure, logging, data migration, backup, rollback, and monitoring before release.
