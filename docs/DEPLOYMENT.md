# Deployment

## Current target
Vercel (standalone output) at **ppc-companion.vercel.app**. Automatic deployment on push to `main`. Branch protection not yet configured.

## Environments

Keep local, test, preview, staging, and production data, credentials, and external integrations isolated where those environments exist.

## Deployment contract

A release must be reproducible from a known commit and lockfile. It must run the same relevant checks used locally, apply migrations safely, expose health status, and support rollback or forward recovery.

## Required release inputs

- version or commit
- environment-specific configuration
- secret references
- migration plan
- validation results
- observability changes
- rollback or recovery steps

## Verification

After deployment, verify health checks, critical-path smoke tests, logs, metrics, database state, and external integration behavior.

## Commands

- Build: `bun run build`
- Test: `npx vitest run`
- End-to-end: `Not yet configured`

Replace unconfigured commands with actual executable steps before the first release.
